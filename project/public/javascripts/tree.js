class treeNode{
	constructor(parentPtr=null, nName=null, nType=null, nValue=null, leftChild=null, rightChild=null, next=null){
		this.parentPtr = parentPtr;
		this.nName = nName;
		this.nType = nType;
		this.nValue = nValue;
		this.leftChild = leftChild;
		this.rightChild = rightChild;
		this.next = next;
	}
}

class field{
	constructor(parentPtr, fieldName){
		this.parentPtr = parentPtr;
		this.fieldName = fieldName;
	}
}

var globalField = new field(null, "global");
var curField = globalField;
var root = new treeNode();
var prevNode = root;
var errCode = null;

//函数作用域相关
function enterField(fieldName){
	var newField = new field(curField, fieldName);
	curField = newField;
}

function leaveField(){
	if(curField.parentPtr == null)
		return null;
	curField = curField.parentPtr;
	return curField.fieldName;
}

function getFieldName(){
	return curField.fieldName;
}


//********************************************
//构建语法树的入口函数 parseTree()
//parameter: lexResult, 词法分析后的Token二维数组
//return: 语法树根节点
//********************************************
function parseTree(lexResult){
	var line = 0;
	while(line < lexResult.length){
		var tempRes = parseDispatch(lexResult, line, 0);
		if(tempRes == null)
			throw "parse failed";
		line = tempRes.line;
		prevNode.next = tempRes.node;
		prevNode = prevNode.next;
	}
	return root;	
}

function buildIdentifier(token){
	var res = new treeNode();
	res.nType = "IDENTIFIER";
	res.nName = token.value;
	res.parentPtr = getFieldName();
	return res;
}

function buildConst(token){
	var res = new treeNode();
	if(token.type == "INTEGER_CONST" || token.type == "REAL_CONST"){
		res.nType = "NUMBER";
	}else if(token.type == "STRING"){
		res.nType = "STRING";
	}else {
		throw "[ERROR] build const failed";
	}
	res.nValue = token.value;
	return res;
}

function parseDispatch(lexResult, line, startIndex){
	var res = {
		"line":null,
		"node":null,
	};
	if(startIndex == lexResult[line].length-1){
		var token = lexResult[line][startIndex];
		if(token.category == "identifier"){
			res.line = line;
			res.node = buildIdentifier(token);
			return res;
		}else if(token.category == "number"){
			res.line = line;
			res.node = buildConst(token);
			return res;
		}
	}
	
	for(var index = startIndex; index < lexResult[line].length; index++){
		var token = lexResult[line][index];	
		if(token.category == "reserved"){
			break;	
		}
		if(token.category == "signals"){
			if(token.type == "COLON"){
				console.log("COLON");

			}else if(token.type == "INDENT"){
				continue;
			}else if(token.type == "COMMA"){

			}
		}

		if(token.category == "identifier"){
			continue;		
		}
			
		if(token.category == "assign"){
			return assignParser(lexResult, line, startIndex);
		}

		if(index == lexResult[line].length - 1){
			return exprParser(lexResult, line, startIndex);
		}
	}
	return res;
}

function exprParser(lexResult, line, startIndex){
	console.log("expr");	
	return null;
}

function compareParser(lexResult, line, startIndex){
	if(lexResult[line].length - startIndex < 3){
		throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid syntax";
	}
}


function assignParser(lexResult, line, startIndex){	
	if(lexResult[line].length - startIndex < 3){
		throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid syntax";
	}
	if(lexResult[line][startIndex].category != "identifier"){
		throw "[ERROR] at line " + (line+1) + "\nSyntaxError: can't assign to " + lexResult[line][startIndex].category;
	}
	if(lexResult[line][startIndex+1].category != "assign"){
		throw "[ERROR] at line " + (line+1) + "\nSyntaxError: can't assign to " + lexResult[line][startIndex+1].category;
	}

	var res = {
		"line":null,
		"node":new treeNode(),
	};

	if(startIndex == 0){
		res.line = line + 1;
	}
	res.node.nType = "ASSIGN";
	res.node.nName = lexResult[line][startIndex+1].value;
	res.node.leftChild = buildIdentifier(lexResult[line][startIndex]);

	var rightRes = parseDispatch(lexResult, line, startIndex+2);
	if(rightRes.node.nType == "FUNC" || rightRes.node.nType == "LOOP" || rightRes.node.nType == "RESERVED"){
		throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid syntax";
	}
	res.node.rightChild = rightRes.node;
	return res;
}

//临时测试用函数
function test(){
	var line = 1;
	throw "[ERROR] at line " + (line+1) + "\nSyntaxError: can't assign to literal";
}
