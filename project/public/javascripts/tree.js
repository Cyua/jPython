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
	globalField = new field(null, "global");
	curField = globalField;
	root = new treeNode();
	prevNode = root;
	errCode = null;
	console.log(lexResult);
	

	while(line < lexResult.length){
		var tempRes = parseDispatch(lexResult, line, 0, lexResult[line].length);
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

function buildList(lexResult, line, startIndex, endIndex){
	return null;	
}

function parseDispatch(lexResult, line, startIndex, endIndex){
	var res = {
		"line":null,
		"node":null,
	};

	if(startIndex == endIndex - 1){
		var token = lexResult[line][startIndex];
		if(token.category == "identifier"){
			res.line = line + 1;
			res.node = buildIdentifier(token);
			return res;
		}else if(token.category == "number"){
			res.line = line + 1;
			res.node = buildConst(token);
			return res;
		}
	}

	if(lexResult[line][startIndex].type == "MLPAREN" && lexResult[line][endIndex - 1].type == "MRPAREN"){
		//TODO: list
		res.line = line + 1;	
		res.node = buildList(lexResult, line, startIndex, endIndex);
		return res;
	}
	
	for(var index = startIndex; index < endIndex; index++){
		var token = lexResult[line][index];	
		if(token.category == "reserved"){
		
		}
		if(token.category == "signals"){
			if(token.type == "COLON"){
				console.log("COLON");

			}else if(token.type == "INDENT"){
				continue;
			}else if(token.type == "COMMA"){

			}
		}

		if(token.category == "assign"){
			return assignParser(lexResult, line, startIndex, endIndex);
		}

		if(index == endIndex - 1){
			return exprParser(lexResult, line, startIndex, endIndex);
		}
	}
	return null;
}


function exprParser(lexResult, line, startIndex, endIndex){
	var res = {
		"line":null,
		"node":null,
	};

	for(var index = startIndex; index < endIndex; index++){
		var token = lexResult[line][index];
		if(token.type == "OR" && token.category == "reserved"){
			if(index == 0 || index == endIndex - 1){
				throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid syntax";
			}
			res.line = line + 1;
			res.node = new treeNode();
			res.node.nType = "EXPR";
			res.node.nName = token.type;

			var leftRes = parseDispatch(lexResult, line, startIndex, index);
			if(leftRes.node.nType == "FUNC" || leftRes.node.nType == "LOOP" || leftRes.node.nType == "BRANCH"){
				throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid syntax";
			}
			res.node.leftChild = leftRes.node;
			var rightRes = parseDispatch(lexResult, line, index+1, endIndex);		
			res.node.rightChild = rightRes.node;
			return res;
		}
	}
		
	for(var index = startIndex; index < endIndex; index++){
		var token = lexResult[line][index];
		if(token.type == "AND" && token.category == "reserved"){
			if(index == 0 || index == endIndex - 1){
				throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid syntax";
			}
			res.line = line + 1;
			res.node = new treeNode();
			res.node.nType = "EXPR";
			res.node.nName = token.type;
			var leftRes = parseDispatch(lexResult, line, startIndex, index);
			if(leftRes.node.nType == "FUNC" || leftRes.node.nType == "LOOP" || leftRes.node.nType == "BRANCH"){
				throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid syntax";
			}
			res.node.leftChild = leftRes.node;
			var rightRes = parseDispatch(lexResult, line, index+1, endIndex);		
			res.node.rightChild = rightRes.node;
			return res;
		}
	}

	for(var index = startIndex; index < endIndex; index++){
		var token = lexResult[line][index];
		if(token.type == "NOT" && token.category == "reserved"){
			if(index != startIndex){
				throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid syntax";
			}
			res.line = line + 1;
			res.node = new treeNode();
			res.node.nType = "EXPR";
			res.node.nName = token.type;
			var leftRes = parseDispatch(lexResult, line, startIndex+1, endIndex);
			if(leftRes.node.nType == "FUNC" || leftRes.node.nType == "LOOP" || leftRes.node.nType == "BRANCH"){
				throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid syntax";
			}
			res.node.leftChild = leftRes.node;
			return res;
		}
	}

	for(var index = startIndex; index < endIndex; index++){
		var token = lexResult[line][index];
		if(token.category == "compare"){
			if(index == startIndex || index == endIndex - 1){
				throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid syntax";
			}
			res.line = line + 1;
			res.node = new treeNode();
			res.node.nType = "EXPR";
			res.node.nName = token.type;
			var leftRes = parseDispatch(lexResult, line, startIndex, index);
			if(leftRes.node.nType == "FUNC" || leftRes.node.nType == "LOOP" || leftRes.node.nType == "BRANCH"){
				throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid syntax";
			}
			res.node.leftChild = leftRes.node;

			var rightRes = parseDispatch(lexResult, line, index+1, endIndex);
			if(rightRes.node.nType == "FUNC" || rightRes.node.nType == "LOOP" || rightRes.node.nType == "BRANCH"){
				throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid syntax";
			}
			if((res.node.nName == "IN" || res.node.nName == "NOTIN") && (rightRes.node.nType != "LIST" && rightRes.node.nType != "FUNC_CALL" && rightRes.node.nType != "IDENTIFIER")){
				throw "[ERROR] at line " + (line+1) + "\nSyntaxError: argument of type "+rightRes.node.nType+" is not iterable";
			}
			res.node.rightChild = rightRes.node;
			return res;
		}
	}
	
	for(var index = startIndex; index < endIndex; index++){
		var token = lexResult[line][index];
		if(token.type == "PLUS" || token.type == "MINUS"){
			if(token.type == "PLUS" && (index == startIndex || index == endIndex -1)){
				throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid syntax";
			}
			if(token.type == "MINUS" && index == endIndex - 1){
				throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid syntax";
			}
			//TODO: negative number
			res.line = line + 1;
			res.node = new treeNode();
			res.node.nType = "EXPR";
			res.node.nName = token.type;

			var leftRes = parseDispatch(lexResult, line, startIndex, index);
			if(leftRes.node.nType == "FUNC" || leftRes.node.nType == "LOOP" || leftRes.node.nType == "BRANCH"){
				throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid syntax";
			}
			if(token.type == "MINUS" && (leftRes.node.nType == "STRING" || leftRes.node.nType == "LIST")){
				throw "[ERROR] at line " + (line+1) + "\nSyntaxError: unsupported operand type for -: " + leftRes.node.nType;
			}
			res.node.leftChild = leftRes.node;

			var rightRes = parseDispatch(lexResult, line, index+1, endIndex);
			if(rightRes.node.nType == "FUNC" || rightRes.node.nType == "LOOP" || rightRes.node.nType == "BRANCH"){
				throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid syntax";
			}
			if(token.type == "MINUS" && (rightRes.node.nType == "STRING" || rightRes.node.nType == "LIST")){
				throw "[ERROR] at line " + (line+1) + "\nSyntaxError: unsupported operand type for -: " + leftRes.node.nType;
			}
			res.node.rightChild = rightRes.node;
			return res;
		}
	}

	for(var index = startIndex; index < endIndex; index++){
		var token = lexResult[line][index];
		if(token.type == "MUL" || token.type == "DIV" || token.type == "MOD"){
			if(index == startIndex || index == endIndex -1){
				throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid syntax";
			}
			res.line = line + 1;
			res.node = new treeNode();
			res.node.nType = "EXPR";
			res.node.nName = token.type;
			var leftRes = parseDispatch(lexResult, line, startIndex, index);
			if(leftRes.node.nType == "FUNC" || leftRes.node.nType == "LOOP" || leftRes.node.nType == "BRANCH"){
				throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid syntax";
			}
			res.node.leftChild = leftRes.node;
			var rightRes = parseDispatch(lexResult, line, index+1, endIndex);
			if(rightRes.node.nType == "FUNC" || rightRes.node.nType == "LOOP" || rightRes.node.nType == "BRANCH"){
				throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid syntax";
			}
			res.node.rightChild = rightRes.node;
			return res;
		}
	}

	throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid syntax";
}



function assignParser(lexResult, line, startIndex, endIndex){	
	if(endIndex - startIndex < 3){
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

	var rightRes = parseDispatch(lexResult, line, startIndex+2, endIndex);
	if(rightRes.node.nType == "FUNC" || rightRes.node.nType == "LOOP" || rightRes.node.nType == "RESERVED" || rightRes.node.nType == "BRANCH"){
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
