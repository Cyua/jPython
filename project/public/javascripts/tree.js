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

//函数作用域相关
var globalField = new field(null, "global");
var curField = globalField;

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
	var root = new treeNode();
	var prevNode = root;
	var line = 0;
	while(line < lexResult.length){
		for(var index = 0; index < lexResult[line].length; index++){
			var token = lexResult[line][index];	

			if(token.category == "signals"){
				if(token.type == "COLON"){
					console.log("COLON");

				}else if(token.type == "INDENT"){
					continue;
				}
			}

			if(token.category == "reserved"){
				
			}
			
			if(token.category == "assign")
			
		}
	}
	return null;	
}

//临时测试用函数
function test(){
	enterField("test1");
	enterField("test2");
	leaveField();
	leaveField();
}
