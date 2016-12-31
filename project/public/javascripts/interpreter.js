const resultTextarea = $('#result')

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
    if (treeNode == null) {
        return
    }
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
            switch (treeNode.nName) {
                case "print":
                    resultTextarea.append(execute(treeNode.leftChild, currentStorage))
                    resultTextarea.append('\n')
                    break
                default:
                    break
            }
            break
        case "IDENTIFIER":
            return currentStorage.variables[treeNode.nName]
            break
        case "ASSIGN":
            currentStorage.variables[treeNode.leftChild.nName] = handlerASSIGN(treeNode, currentStorage)
            break
        case "EXPR":
            return handlerEXPR(treeNode, currentStorage)
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

function handlerEXPR(treeNode, currentStorage) {
    let operand1 = execute(treeNode.leftChild, currentStorage)
    let operand2 = execute(treeNode.rightChild, currentStorage)
    let operator = treeNode.nName
    let value
    switch (operator) {
        case "PLUS":
            value = operand1 + operand2
            break
        case "MINUS":
            value = operand1 - operand2
            break
        case "MUL":
            value = operand1 * operand2
            break
        case "DIV":
            value = operand1 / operand2
            break
        case "MOD":
            value = operand1 % operand2
            break
        case "GREATER":
            value = operand1 > operand2
            break
        case "LESS":
            value = operand1 < operand2
            break
        case "EQUAL":
            value = operand1 == operand2
            break
        case "GREATERE":
            value = operand1 >= operand2
            break
        case "LESSE":
            value = operand1 <= operand2
            break
        case "NOTE":
            value = operand1 != operand2
            break
        case "AND":
            value = operand1 && operand2
            break
        case "OR":
            value = operand1 || operand2
            break
        case "NOT":
            value = !operand1
            break
        case "IN":
            for (i in operand2) {
                if (operand1 === operand2[i]) {
                    value = true
                }
            }
            value = false
            break
        case "NOTIN":
            for (i in operand2) {
                if (operand1 === operand2[i]) {
                    value = false
                }
            }
            value = true
            break
        default:
            break;
    }
    return value
}
