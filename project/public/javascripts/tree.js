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

function parseTree(lexResult){
	var root = new treeNode();
	var prevNode = root;
	var line = 0;
	while(line < lexResult.length){
		var lineType = null;
		for(var index = 0; index < lexResult[line].length; index++){
			var token = lexResult[line][index];	
		}
	}
	return null;	
}
