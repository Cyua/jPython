class storage{
	constructor(parent = null, variables = {}, functions = {}) {
		this.parent = parent
        this.variables = variables
        this.functions = functions
	}
}

function interpreter(root) {
    let currentStorage = new storage()
    let single_input = root.next
    while (single_input != null) {
        execute(single_input, currentStorage)
        single_input = single_input.next
    }
    console.log(currentStorage)
}

function execute(treeNode, currentStorage) {
    console.log(treeNode)
    console.log(currentStorage)
    switch (treeNode.nType) {
        case "NUMBER":
            return parseInt(treeNode.nValue)
            break
        case "STRING":
            return treeNode.nValue
            break
        case "LIST":
            break
        case "FUNC":
            break
        case "FUNC_CALL":
            break
        case "LOOP":
            break
        case "BRANCH":
            break
        case "RESERVED":
            break
        case "IDENTIFIER":
            return currentStorage.variables[treeNode.nName]
            break
        case "ASSIGN":
            currentStorage.variables[treeNode.leftChild.nName] = handlerASSIGN(treeNode, currentStorage)
            break
        case "EXPR":
            break
        default:
            break
    }
}

function handlerASSIGN(treeNode, currentStorage) {
    let self = currentStorage.variables[treeNode.leftChild.nName]
    let assignmentOperator = treeNode.nName
    let assignmentValue = execute(treeNode.rightChild, currentStorage)
    switch (assignmentOperator) {
        case "*=":
            assignmentValue *= self
            break
        case "+=":
            assignmentValue += self
            break
        case "-=":
            assignmentValue = self - assignmentValue
            break
        case "/=":
            assignmentValue = self / assignmentValue
            break
        case "%=":
            assignmentValue = self % assignmentValue
            break
        case "=":
            break
        default:
            break
    }
    return assignmentValue
}
