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
	constructor(parentPtr, fieldName, level=0){
		this.parentPtr = parentPtr;
		this.fieldName = fieldName;
		this.level = level;
	}
}

var globalField = new field(null, "global", 0);
var curField = globalField;
var root = new treeNode();
var prevNode = root;
var errCode = null;
var funcNameList = [];

//函数作用域相关
function enterField(fieldName, type){
	if(type == "func"){
		var tempField = curField;
		while(tempField != null){
			if (tempField.fieldName == fieldName)
				throw "[ERROR] at function ' " + fieldName + "'\nSyntaxError: duplicated function name";
			tempField = tempField.parentPtr;
		}
		for(var i = 0; i < funcNameList.length; i++){
			if(fieldName == funcNameList[i])
				throw "[ERROR] at function '" + fieldName + "'\nSyntaxError: duplicated function name";
		}
		funcNameList.push(fieldName);
	}
	var newField = new field(curField, fieldName, getCurLevel()+1);
	curField = newField;
}

function leaveField(){
	if(curField.parentPtr == null)
		return null;
	curField = curField.parentPtr;
	return curField.fieldName;
}

function getFieldName(){
	var tempField = curField;
	while(tempField != null){
		if(tempField.fieldName == "while" || tempField.fieldName == "if" || tempField.fieldName == "else" || tempField.fieldName == "for"){
			tempField = tempField.parentPtr;
			continue;
		}else{
			return tempField.fieldName;
		}
	}
	return "global";
}

function getCurLevel(){
	return curField.level;
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
	funcNameList = [];

	while(line < lexResult.length){
		var tempRes = parseDispatch(lexResult, line, 0, lexResult[line].length);
		if(tempRes == null)
			throw "parse failed";
		line = tempRes.line;
		prevNode.next = tempRes.node;
		prevNode = prevNode.next;
	}
	console.log(root);
	return root;	
}


function calcIndentLevel(lexResult, line){
	var cnt = 0;
	for(var index = 0; index < lexResult[line].length; index ++){
		var token = lexResult[line][index];
		if(token.type == "INDENT"){
			cnt += 1;
			continue;
		}else{
			break;
		}
	}
	return cnt;
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


function findPairedBracket(lexResult, line, startIndex, endIndex){
	var res = {
		"left": null,
		"right": null,
	};
	var pairCount = 0;
	for(var index = startIndex; index < endIndex; index++){
		var token = lexResult[line][index];
		if(token.type == "LPAREN"){
			if(res.left == null){
				res.left = index;
			}
			pairCount += 1;
			continue;
		}
		if(token.type == "RPAREN"){
			if(res.left == null){
				throw "[ERROR] at line " + (line+1) + "\nSyntaxError: find unpaired brackets";
			}else{
				pairCount -= 1;
				if(pairCount == 0){
					res.right = index;
					return res;
				}else if(pairCount < 0){
					throw "[ERROR] at line " + (line+1) + "\nSyntaxError: find unpaired brackets";
				}
			}
		}
	}
	if(pairCount == 0)
		return null;
	throw "[ERROR] at line " + (line+1) + "\nSyntaxError: find unpaired brackets";
}


function parseDispatch(lexResult, line, startIndex, endIndex){
	var res = {
		"line":null,
		"node":null,
	};

	if(startIndex >= endIndex){
		return res;
	}

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
		}else{
			throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid syntax";
		}
	}

	if(lexResult[line][startIndex].type == "MLPAREN" && lexResult[line][endIndex - 1].type == "MRPAREN"){
		//TODO: list
		res.line = line + 1;	
		res.node = buildList(lexResult, line, startIndex, endIndex);
		return res;
	}
	
	var indentCnt = 0;
	for(var index = startIndex; index < endIndex; index++){
		var token = lexResult[line][index];	
		if(token.type == "INDENT"){
			indentCnt += 1;	
			startIndex = index + 1;
			continue;
		}
		if(indentCnt > 0 && getCurLevel() != indentCnt){
			throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid indents";
		}

		if(lexResult[line].length >= 3 && lexResult[line][startIndex].category == "identifier" && 
			lexResult[line][startIndex+1].type == "LPAREN" && lexResult[line][endIndex-1].type == "RPAREN"){
				return funCallParser(lexResult, line, startIndex, endIndex);
		}

		if(token.category == "reserved"){
			if(token.type == "DEF")	{
				if(index != startIndex){
					throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid syntax";
				}else{
					return funDefParser(lexResult, line, startIndex, endIndex);
				}
			}else if(token.type == "WHILE"){
				if(index != startIndex){
					throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid syntax";
				}else{
					return whileParser(lexResult, line, startIndex, endIndex);
				}
			}else if(token.type == "PRINT"){
				if(index != startIndex){
					throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid syntax";
				}else{
					return printParser(lexResult, line, startIndex, endIndex);
				}
			}else if(token.type == "RETURN"){
				if(index != startIndex){
					throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid syntax";
				}else{
					return returnParser(lexResult, line, startIndex, endIndex);
				}
			}
		}
		if(token.category == "signals"){
			if(token.type == "COLON"){
				console.log("COLON");
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


function funCallParser(lexResult, line, startIndex, endIndex){
	var res = {
		"line": line+1,
		"node":new treeNode(),
	};
	res.node.nType = "FUNC_CALL";
	var func = lexResult[line][startIndex];
	res.node.nName = func.value;
	res.node.leftChild = funCallArgsParse(lexResult, line, startIndex+2, endIndex-1);
	return res;
}


function funCallArgsParse(lexResult, line, startIndex, endIndex){
	if(startIndex >= endIndex){
		return null;
	}
	var res = null;
	var token = lexResult[line][startIndex];
	if(token.type == "IDENTIFIER"){
		res = buildIdentifier(token);
	}else if(token.category == "number"){
		res = buildConst(token);
	}else{
		throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid function args";
	}
	res.leftChild = funCallArgsParse(lexResult, line, startIndex+2, endIndex);
	return res;
}


function funDefParser(lexResult, line, startIndex, endIndex){
	if(endIndex - startIndex < 5)
		throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid function definition";
	if(lexResult[line][startIndex+1].type != "IDENTIFIER")
		throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid function definition";
	if(lexResult[line][startIndex+2].type != "LPAREN")
		throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid function definition";
	if(lexResult[line][endIndex-1].type != "COLON")
		throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid function definition";
	if(lexResult[line][endIndex-2].type != "RPAREN")
		throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid function definition";
	var funcNameNode = lexResult[line][startIndex+1];
	var funcName = funcNameNode.value;
	enterField(funcName, "func");
	var res = {
		"line":null,
		"node":null,
	};
	var curIndents = getCurLevel();
	var i = line + 1;
	for(; i < lexResult.length; i++){
		if(calcIndentLevel(lexResult, i) < curIndents){
			break;
		}
	}
	if(i == line+1){
		throw "[ERROR] at line " + (line+2) + "\nSyntaxError: expect indents";
	}
	res.line = i
	res.node = new treeNode();
	res.node.nType = "FUNC";
	res.node.nName = funcName;
	var funArgs = parseFuncArgs(lexResult, line, startIndex+3, endIndex-2);
	res.node.leftChild = funArgs;
	var lineNum = line+1;
	res.node.rightChild = new treeNode();
	var tempNode = res.node.rightChild;
	while(lineNum < i){
		var tempRes = parseDispatch(lexResult, lineNum, 0, lexResult[lineNum].length);
		if(tempRes == null)
			throw "parse failed";
		lineNum = tempRes.line;
		tempNode.next = tempRes.node;
		tempNode = tempNode.next;
	}
	res.node.rightChild = res.node.rightChild.next;
	leaveField();
	return res;
}


function parseFuncArgs(lexResult, line, startIndex, endIndex){
	if(startIndex >= endIndex)
		return null;
	var token = lexResult[line][startIndex];
	if(token.type != "IDENTIFIER"){
		throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid function args";
	}
	var res = buildIdentifier(token);
	res.rightChild = parseFuncArgs(lexResult, line, startIndex+2, endIndex);
	return res;
}


function returnParser(lexResult, line, startIndex, endIndex){
	if(endIndex - startIndex != 2){
		throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid syntax";
	}
	var token = lexResult[line][startIndex+1];
	if(token.type != "IDENTIFIER" && token.category != "number"){
		throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid syntax";
	}
	var res = {
		"line":line+1,
		"node":new treeNode(),
	}
	var leftRes = parseDispatch(lexResult, line, startIndex+1, endIndex);
	res.node.nType = "RESERVED";
	res.node.nName = "return";
	res.node.leftChild = leftRes.node;
	return res;
}


function printParser(lexResult, line, startIndex, endIndex){
	if(endIndex - startIndex != 2)
		throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid syntax";
	var token = lexResult[line][startIndex+1];
	if(token.type != "IDENTIFIER" && token.category != "number"){
		throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid syntax";
	}
	var res = {
		"line":line+1,
		"node":new treeNode(),
	}
	var leftRes = parseDispatch(lexResult, line, startIndex+1, endIndex);
	res.node.nType = "RESERVED";
	res.node.nName = "print";
	res.node.leftChild = leftRes.node;
	return res;
}


function whileParser(lexResult, line, startIndex, endIndex){
	if(endIndex - startIndex < 3)
		throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid syntax";
	if(lexResult[line][endIndex-1].type != "COLON")
		throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid syntax";
	enterField(getFieldName(), "while");
	var res = {
		"line":null,
		"node":null,
	};
	var curIndents = getCurLevel();
	var i = line + 1;
	for(; i < lexResult.length; i++){
		if(calcIndentLevel(lexResult, i) < curIndents){
			break;
		}
	}
	if(i == line + 1){
		throw "[ERROR] at line " + (line+2) + "\nSyntaxError: expect indents";
	}
	
	res.line = i;
	res.node = new treeNode();
	res.node.nType = "LOOP"
	res.node.nName = "WHILE"
	var caseRes = parseDispatch(lexResult, line, startIndex+1, endIndex-1);
	res.node.leftChild = caseRes.node;
	var tempLine = line + 1;
	res.node.rightChild = new treeNode();
	var tempNode = res.node.rightChild;
	while(tempLine < i){
		console.log(tempLine);
		var tempRes = parseDispatch(lexResult, tempLine, 0, lexResult[tempLine].length);
		tempNode.next = tempRes.node;
		tempNode = tempNode.next;
		tempLine = tempRes.line;
	}
	res.node.rightChild = res.node.rightChild.next;
	leaveField();
	return res;
}


function exprParser(lexResult, line, startIndex, endIndex){
	var res = {
		"line":null,
		"node":null,
	};

	var bracket = findPairedBracket(lexResult, line, startIndex, endIndex);	
	if(bracket != null){
		if(bracket.left > startIndex){
			var token = lexResult[line][bracket.left - 1];
			if(token.category != "operators" && token.category != "compare" &&
			token.category != "assign" && token.category != "reserved"){
				throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid syntax";
			}
			if(token.category == "reserved" && (token.type != "AND" && token.type != "OR" && token.type != "NOT")){
				throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid syntax";
			}
			res.line = line + 1;
			res.node = new treeNode();
			res.node.nType = "EXPR";	
			res.node.nName = token.type;
			var leftRes = parseDispatch(lexResult, line, startIndex, bracket.left-1);
			res.node.leftChild = leftRes.node;
			var rightRes = parseDispatch(lexResult, line, bracket.left, endIndex);
			res.node.rightChild = rightRes.node;
			return res;
		}else if(bracket.right == endIndex - 1){
			return parseDispatch(lexResult, line, startIndex+1, endIndex-1);
		}else{
			var token = lexResult[line][bracket.right + 1];
			if(token.category != "operators" && token.category != "compare" &&
			token.category != "assign" && token.category != "reserved"){
				throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid syntax";
			}
			if(token.category == "reserved" && (token.type != "AND" && token.type != "OR")){
				throw "[ERROR] at line " + (line+1) + "\nSyntaxError: invalid syntax";
			}
			res.line = line + 1;
			res.node = new treeNode();
			res.node.nType= "EXPR";
			res.node.nName = token.type;
			var leftRes = parseDispatch(lexResult, line, startIndex+1, bracket.right);
			res.node.leftChild = leftRes.node;
			var rightRes = parseDispatch(lexResult, line, bracket.right+2, endIndex);
			res.node.rightChild = rightRes.node;
			return res;
		}
	}

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

	//if(startIndex == 0){
	//	res.line = line + 1;
	//}
	res.line = line + 1;
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
