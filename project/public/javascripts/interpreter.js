const resultTextarea = $('#result')
let error = {
	"error": true
}
let loopKeyword = {}

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
    switch (treeNode.nType) {
        case "NUMBER":
            return parseInt(treeNode.nValue)
            break
        case "STRING":
            return treeNode.nValue
            break
        case "LIST":
			let list = []
			let element = treeNode.rightChild
			while (element != null) {
				list[list.length] = execute(element, currentStorage)
				element = element.rightChild
			}
			return list
            break
        case "FUNC":
            treeNode.parameters = {}
            let parameter1 = treeNode.leftChild
            while (parameter1 != null) {
                treeNode.parameters[parameter1.nName] = null
                parameter1 = parameter1.rightChild
            }
            currentStorage.functions[treeNode.nName] = treeNode
            break
        case "FUNC_CALL":
            let newStorage = new storage()
            newStorage.parent = currentStorage
            let theFunction = currentStorage.functions[treeNode.nName]
            while (theFunction == null) {
                if (currentStorage.parent == null) {
					error.value = "[ERROR] " + treeNode.nName + " is not defined"
                    throw error
                } else {
					theFunction = currentStorage.parent.functions[treeNode.nName]
				}
            }
            let number = Object.getOwnPropertyNames(theFunction.parameters).length
            let parameter2 = treeNode.leftChild
            for (i in theFunction.parameters) {
                if (parameter2 == null) {
					error.value = "[ERROR] at function '" + treeNode.nName + "'\nTypeError: needs exactly " + number + " parameters"
                    throw error
                }
                newStorage.variables[i] = execute(parameter2, currentStorage)
                parameter2 = parameter2.leftChild
            }
            if (parameter2 != null) {
				error.value = "[ERROR] at function '" + treeNode.nName + "'\nTypeError: needs exactly " + number + " parameters"
				throw error
            }
            let single_input = theFunction.rightChild
			try {
				while (single_input != null) {
	                execute(single_input, newStorage)
	                single_input = single_input.next
	            }
			} catch (e) {
				if (typeof(e) === 'object' && e.error) {
					throw error
				}
				return e
			}
            break
        case "LOOP":
			let loopType = treeNode.nName
			switch (loopType) {
				case "FOR":
					let forI
					let forCaseIName = treeNode.leftChild.leftChild.nName
					let forCaseList = execute(treeNode.leftChild.rightChild, currentStorage)
					try {
						for (forI = 0; forI < forCaseList.length; forI++) {
							try {
								currentStorage.variables[forCaseIName] = forCaseList[forI]
								let forBody = treeNode.rightChild
								while (forBody != null) {
									execute(forBody, currentStorage)
									forBody = forBody.next
								}
							} catch (e) {
								console.log("HHHHHHHHHHHHHHHHHH")
								if (typeof(e) === 'object' && e.error) {
									throw error
								} else if (typeof(e) === 'object' && e.value === 'break') {
									throw error
								} else if (typeof(e) === 'object' && e.value === 'continue') {
								} else {
									return e
								}
							}
						}
					} catch (e) {
						if (typeof(e) === 'object' && e.error) {
							throw error
						} else if (typeof(e) === 'object' && e.value === 'break') {
							throw error
						} else {
							return e
						}
					}
					break
				case "WHILE":
					break
				default:
					break
			}
            break
        case "BRANCH":
			if (execute(treeNode.leftChild.leftChild, currentStorage)) {
				execute(treeNode.leftChild.rightChild, currentStorage)
			} else if (treeNode.rightChild != null) {
				execute(treeNode.rightChild.rightChild, currentStorage)
			}
            break
        case "RESERVED":
            switch (treeNode.nName) {
                case "print":
					let printValue = execute(treeNode.leftChild, currentStorage)
					if (typeof(printValue) === 'object') {
						handlerPRINTLIST(printValue)
					} else if (printValue === false) {
						resultTextarea.append('false')
					} else if (typeof(printValue) === 'string') {
						resultTextarea.append('"')
						resultTextarea.append(printValue)
						resultTextarea.append('"')
					} else {
						resultTextarea.append(printValue)
					}
                    resultTextarea.append('\n')
                    break
				case "return":
					throw execute(treeNode.leftChild, currentStorage)
					break
				case "true":
					return true
					break
				case "false":
					return false
					break
				case "continue":
					loopKeyword.value = 'continue'
					throw loopKeyword
					break
				case "break":
					loopKeyword.value = 'break'
					throw loopKeyword
					break
                default:
                    break
            }
            break
        case "IDENTIFIER":
			while (currentStorage.variables[treeNode.nName] === undefined) {
				if (currentStorage.parent == null) {
					error.value = "[ERROR]\nNameError: name '" + treeNode.nName + "' is not defined"
					throw error
				} else {
					currentStorage = currentStorage.parent
				}
			}
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
			if (typeof(operand1) !== 'object' && typeof(operand2) !== 'object') {
				value = operand1 + operand2
			} else if (typeof(operand1) === 'object' && typeof(operand2) === 'object') {
				value = operand1.concat(operand2)
			} else {
				error.value = "[ERROR] wrong usage of '+'"
				throw error
			}
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
                    return true
                }
            }
            value = false
            break
        case "NOTIN":
            for (i in operand2) {
                if (operand1 === operand2[i]) {
                    return false
                }
            }
            value = true
            break
        default:
            break
    }
    return value
}

function handlerPRINTLIST(list) {
	resultTextarea.append('[')
	for (i in list) {
		if (typeof(list[i]) === 'object') {
			if (i != 0) {
				resultTextarea.append(', ')
			}
			handlerPRINTLIST(list[i])
		} else if (i == 0) {
			resultTextarea.append(list[i])
		} else {
			resultTextarea.append(', ')
			resultTextarea.append(list[i])
		}
	}
	resultTextarea.append(']')
}
