function getNextToken(line,str){
	var RESERVED_KEYWORDS = new Array('def','break','if','else','elif','for','and','or','not','continue','while','return','print');
	var Token = new Object() 
    var inter = /^[0-9]+$/;
    var real = /^\d+\.\d+$/;
    var id = /^([A-Za-z]|_)\w+$/;
	if(inter.test(str)==true){
		Token.category = "number";
		Token.type = "INTEGER_CONST";
		Token.value = str;
	}
	else if(real.test(str)==true){
        Token.category = "number";
		Token.type = 'REAL_CONST';
		Token.value = str;
	}
	else if(str.charAt(0)=="\""||str.charAt(0)=="\'"){
		Token.category = "number";
		Token.type = 'STRING';
		Token.value = str.slice(1,-1);
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
		case "in":
			Token.category = "compare";
			Token.type = "IN";
			Token.value = str;
			break;
		case "not in":
			Token.category = "compare";
			Token.type = "NOTIN";
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
		case ",":
			Token.category = "signals";
			Token.type = "COMMA";
			Token.value = ",";
			break;
		default:
			Token.category = "identifier";
			Token.type = "IDENTIFIER";
			Token.value = str;
			if(id.test(str)!=true){
				throw "[ERROR] at line " + line + "\nSyntaxError: invalid identifier";
			}
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
	//多个空格替换
	var regEx = /\s+/g;
	line = line.replace(regEx, ' ');
	//分词
    var linearr = line.split(" ");
    //检查冒号
    if(linearr[linearr.length-1]!=":"&&linearr[linearr.length-1].slice(-1)==":"){
    	linearr[linearr.length-1]=linearr[linearr.length-1].slice(0,-1);
    	linearr[linearr.length]=":"
    }
    //检查逗号
    //检查括号
    /*
    for (j=0;j<linearr.length;j++){
		if(linearr[j].charAt(0)=="("){
			linearr.splice(j,0,"(");
			linearr[j+1]=linearr[j+1].slice(1);
			//alert("ok")
		}
		else if(linearr[j].slice(-1)=="("){
			linearr.splice(j+1,0,"(");
			linearr[j]=linearr[j].slice(0,-1);
			j = j+1;
		}
		else if(linearr[j].slice(-1)==")"){
			linearr.splice(j+1,0,")");
			linearr[j]=linearr[j].slice(0,-1);
			j = j+1;
		}
		else if(linearr[j].charAt(0)=="["){
			linearr.splice(j,0,"[");
			linearr[j+1]=linearr[j+1].slice(1);
		}
		else if(linearr[j].slice(-1)=="["){
			linearr.splice(j+1,0,"[");
			linearr[j]=linearr[j].slice(0,-1);
			j = j+1;
		}
		else if(linearr[j].slice(-1)=="]"){
			linearr.splice(j+1,0,"]");
			linearr[j]=linearr[j].slice(0,-1);
			j = j+1;
		}
		else if(linearr[j].slice(-1)==","){
			linearr.splice(j+1,0,",");
			linearr[j]=linearr[j].slice(0,-1);
			j = j+1;
		}
	}*/
	for (j=0;j<linearr.length;j++){
		if(linearr[j].indexOf("(")!= -1){
			var index = linearr[j].indexOf("(")
			linearr.splice(j+1,0,"(");
			linearr.splice(j+2,0,linearr[j].slice(index+1));
			linearr[j]=linearr[j].slice(0,index);
			j = j+1;
		}
		else if(linearr[j].indexOf("[")!= -1){
			var index = linearr[j].indexOf("[")
			linearr.splice(j+1,0,"[");
			linearr.splice(j+2,0,linearr[j].slice(index+1));
			linearr[j]=linearr[j].slice(0,index);
			j = j+1;
		}
		else if(linearr[j].indexOf("]")!= -1){
			var index = linearr[j].indexOf("]")
			linearr.splice(j+1,0,"]");
			linearr.splice(j+2,0,linearr[j].slice(index+1));
			linearr[j]=linearr[j].slice(0,index);
			j = j+1;
		}
		else if(linearr[j].indexOf(")")!= -1){
			var index = linearr[j].indexOf(")");
			linearr.splice(j+1,0,")");
			linearr.splice(j+2,0,linearr[j].slice(index+1));
			linearr[j]=linearr[j].slice(0,index);
			j = j+1;
		}
		else if(linearr[j].indexOf(",")!= -1){
			var index = linearr[j].indexOf(",")
			linearr.splice(j+1,0,",");
			linearr.splice(j+2,0,linearr[j].slice(index+1));
			linearr[j]=linearr[j].slice(0,index);
			j = j+1;
		}
	}
	for(n=0;n<linearr.length;n++){
		if(linearr[n]==""){
			linearr.splice(n,1);
			n = n -1;
		}
	}
	for (j=0,m=0;m<linearr.length;j++,m++){
		if(linearr[j]=="not"&&linearr[j+1]=="in"){
	   		tokens[j+i] = getNextToken("not in");
	   		m = m + 1
	    }
	    else{
	    	tokens[j+i]= getNextToken(m,linearr[m]);
	    }
		
	}
	return tokens
}
function Lex(){
	//var res =  document.getElementById("result");
	var text = codemirrorEditor.doc.getValue();
	//多个换行替换
	//var regEx = /\n+/g;
	//text = text.replace(regEx, '\n');
	var textarr = text.split("\n");
	for(var i=0;i<textarr.length;i++){
		if(textarr[i].length==0){
		textarr.splice(i,1);
		i = i-1;
		}
	}
	var line = new Array();
	for(var i=0;i<textarr.length;i++){
	   		line[i] = getToken(textarr[i]);
    }
    /*for(var i=0;i<line.length;i++){
    	for (var j=0;j<line[i].length;j++){
    		res.value += line[i][j].type+" ";
    	}
    	
    }*/
    return line;
}
