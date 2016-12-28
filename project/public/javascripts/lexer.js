function getNextToken(str){
	var RESERVED_KEYWORDS = new Array('def','break','if','else','elif','for','in','and','or','not','continue','while','return','print');
	var Token = new Object() 
    var inter = /^[0-9]+$/;
    var real = /^\d+\.\d+$/;
	if(inter.test(str)==true){
		Token.category = "number";
		Token.type = "INTEGER_CONST";
		Token.value = str;
	}
	else if(real.test(str)==true){
        Token.category = "NUMBER";
		Token.type = 'REAL_CONST';
		Token.value = str;
	}
	else if(RESERVED_KEYWORDS.indexOf(str)!= -1){
		Token.category = "reserved";
		Token.type = str.toUpperCase();
		Token.value = str;
	}
	else{
		switch(str){
		//operator
		case "+":
			Token.category = "operators";
			Token.type = "PLUS";
			Token.value = str;
			break;
		case "-":
			Token.category = "operators";
			Token.type = "MINUS";
			Token.value = str;
			break;
		case "*":
			Token.category = "operators";
			Token.type = "MUL";
			Token.value = str;
			break;
		case "/":
			Token.category = "operators";
			Token.type = "DIV";
			Token.value = str;
			break;
		case "%":
			Token.category = "operators";
			Token.type = "MOD";
			Token.value = str;
			break;
		case "~":
			Token.category = "operators";
			Token.type = "OPPO";
			Token.value = str;
			break;
		case "&":
			Token.category = "operators";
			Token.type = "AND";
			Token.value = str;
			break;
		case "|":
			Token.category = "operators";
			Token.type = "OR";
			Token.value = str;
			break;
		//assign
		case "+=":
			Token.category = "assign";
			Token.type = "PLUSE";
			Token.value = str;
			break;
		case "-=":
			Token.category = "assign";
			Token.type = "MINUSE";
			Token.value = str;
			break;
		case "*=":
			Token.category = "assign";
			Token.type = "MULE";
			Token.value = str;
			break;
		case "/=":
			Token.category = "assign";
			Token.type = "DIVE";
			Token.value = str;
			break;
		case "%=":
			Token.category = "assign";
			Token.type = "MOLE";
			Token.value = str;
			break;
		case "=":
			Token.category = "assign";
			Token.type = "ASSIGN";
			Token.value = str;
			break;
		//compare
		case ">":
			Token.category = "compare";
			Token.type = "GREATER";
			Token.value = str;
			break;
		case "<":
			Token.category = "compare";
			Token.type = "LESS";
			Token.value = str;
			break;
		case "==":
			Token.category = "compare";
			Token.type = "EQUAL";
			Token.value = str;
			break;
		case ">=":
			Token.category = "compare";
			Token.type = "GREATERE";
			Token.value = str;
			break;
		case "<=":
			Token.category = "compare";
			Token.type = "LESSE";
			Token.value = str;
			break;
		case "!=":
			Token.category = "compare";
			Token.type = "NOTE";
			Token.value = str;
			break;
		//brackets
		case "(":
			Token.category = "brackets";
			Token.type = "LPAREN";
			Token.value = str;
			break;
		case ")":
			Token.category = "brackets";
			Token.type = "RPAREN";
			Token.value = str;
			break;
		case "[":
			Token.category = "brackets";
			Token.type = "MLPAREN";
			Token.value = str;
			break;
		case "]":
			Token.category = "brackets";
			Token.type = "MLPAREN";
			Token.value = str;
			break;
		case "{":
			Token.category = "brackets";
			Token.type = "BLPAREN";
			Token.value = str;
			break;
		case "}":
			Token.category = "brackets";
			Token.type = "BLPAREN";
			Token.value = str;
			break;
		//signal
		case "INDENT":
			Token.category = "signals";
			Token.type = "INDENT";
			Token.value = str;
			break;
		case ":":
			Token.category = "signals";
			Token.type = "COLON";
			Token.value = ":";
			break;
		default:
			Token.category = "identifer";
			Token.type = "IDENTIFER";
			Token.value = str;
			break;

		}
	}
	
	return Token
}

//返回token一维数组
function getToken(line){
	var tokens = new Array();
	var i = 0;
	while (line[0]==" "){
		tokens[i] = getNextToken("INDENT");
		//tokens[i] = "INDENT";
		line = line.slice(4);
		//alert("wrong")
		i = i + 1
	}
    var linearr = line.split(" ");
	for (j=0;j<linearr.length;j++){
		tokens[j+i]= getNextToken(linearr[j]);
	}
	return tokens
}
function Lex(){
	var res =  document.getElementById("result");
	var text = codemirrorEditor.doc.getValue();
	var textarr = text.split("\n");
	var line = new Array();
	for(var i=0;i<textarr.length;i++){
       line[i] = getToken(textarr[i]);
    }
    return line
    /*for(var i=0;i<line.length;i++){
    	for (var j=0;j<line[i].length;j++){
    		res.value += line[i][j].category;
    	}
    	
    }*/
    
}