import * as esprima from 'esprima';

let data_array = [];

const parseCode = (codeToParse) => {
    let json = esprima.parseScript(codeToParse);
    data_array = codeToParse.split('\n');
    iterateBlock(json, data_array);
    return result;
};

export {parseCode};
let line_number = 0;
let result = [];//the result map
let var_map = {};//the map of the locals variables
let input_vector = {};//the map of the global variables
let tmp_map = {};//map for a if loop
let isLoop = false;//if it is a if loop
let while_map = {};//map for a while loop
let isWhile = false;//if it is a while loop
let isFunction = false;
let typeToHandlerMapping = {'Program': iterateProgram,
    'FunctionDeclaration': iterateFunction,
    'VariableDeclaration': iterateVariable,
    'IfStatement': ifStatement,
    'WhileStatement': whileStatement,
    'BlockStatement': BlockStatement,
    'ExpressionStatement': ExpressionStatement,
    'ReturnStatement': ReturnStatement};

let expressionTypeMapping = {'BinaryExpression': BinaryExpression,
    'UnaryExpression': UnaryExpression,
    'UpdateExpression': UpdateExpression,
    'MemberExpression': MemberExpression};

function iterateBlock(json){
    let func = typeToHandlerMapping[json.type];
    func ? func.call(undefined, json) : '';
}

function iterateProgram(json) {
    line_number = -1;
    result = [];
    var_map = {};
    input_vector = {};
    isLoop = false;
    while_map = {};
    isWhile = false;
    isFunction = false;
    for (var i in json.body) {
        nextLine(data_array);
        iterateBlock(json.body[i]);
    }
}

function iterateFunction(json){
    result.push(data_array[line_number]);
    isFunction = true;
    for (var i in json.params) {
        input_vector[json.params[i].name] = '';
    }
    iterateBlock(json.body);
    let line = '}';
    result.push(line);
    isFunction = false;
}

function BlockStatement(json) {
    for (var i in json.body) {
        nextLine(data_array);
        iterateBlock(json.body[i]);
    }
}

function iterateVariable(json){
    for (var i in json.declarations) {
        var name = json.declarations[i].id.name;
        var value = iterateValue(json,i);
        if (json.declarations[i].init) {
            if (json.declarations[i].init.type != 'Literal')
                value = replaceVar(value);
        }
        if(!(name in input_vector))
            funct(name,value);
        else
            result.push(data_array[line_number]);
    }
}

function funct(name, value){
    if (isFunction)
        var_map[name]=value;
    else {
        input_vector[name] = value;
        result.push(data_array[line_number]);
    }
}

function iterateValue(json,i){
    var value;
    if (json.declarations[i].init != null) {
        if(json.declarations[i].init.type == 'Identifier')
            value = json.declarations[i].init.name;
        else
            value = iterateExpressionForVariable(json.declarations[i].init);
    }
    else
        value = ' ';
    return value;
}

function ExpressionStatement(json) {
    var name; var value; let line = '';
    if (json.expression.type == 'UpdateExpression'){
        value = iterateExpression(json.expression);
        name = json.expression.argument.name;
        line = value;
        handleVar(name, line, value);
    }
    else if (json.expression.type == 'AssignmentExpression'){
        let arr = handleAssignment(json);
        name = arr[0];
        line = arr[1];
    }
    else {
        name = json.expression.left.name;
        value = iterateExpression(json.expression.right);
        handleVar(name, line, value);
    }
    if (name in input_vector) printLine(line + ';');
}

function handleAssignment(json){
    var name; var value = ''; let line; let arr = ['',''];
    if (json.expression.left.type == 'MemberExpression'){
        let val = iterateExpression(json.expression.left.property);
        name = json.expression.left.object.name + '[' + val + ']';
        arr[0] = name.substring(0,name.indexOf('['));
    }
    else { name = json.expression.left.name;
        arr[0] = name;
    }
    let res = iterateExpressionForVariable(json.expression.right);
    if (json.expression.right.type != 'Literal') {
        value = handleValue(res, value);
    }
    else value = json.expression.right.value;
    line = name + ' = ' + value;
    handleVar(name, line, value);
    arr[1] = line;
    return arr;
}

function handleValue(res, value){
    let ans = '';
    if (con(res)>1) {
        for (var i = 0; i < res.length; i++) {
            if (toDelete(res, i)) {
                value = replaceVar(res[i]);
                value = iterateEquation(value);
                ans = ans + value;
            } else ans = ans + res[i];
        }
    } else {
        value = replaceVar(res);
        ans = iterateEquation(value);
    }
    ans = ifUpdate(ans);
    return ansFunc(ans);
}

function ifUpdate(ans){
    let idx = ans.indexOf('+');
    if (idx != -1){
        if (ans[idx+1] == '+'){
            ans = ans.substring(0,ans.indexOf('+')) + ' + 1' + ans.substring(idx+2,ans.length);
        }
    }

    return ans;
}

function ansFunc(ans){
    try {
        ans = eval(ans);
        return ans;
    } catch (e) {
        return ans;
    }
}

function con(res){
    let arr = res.split(' ');
    let count = 0;
    let map = {};
    if (isWhile)
        map = while_map;
    else if (isLoop)
        map = tmp_map;
    else map = var_map;
    for (var i = 0; i<arr.length; i++){
        if (arr[i] in map){
            count++;
        }
    }
    return count;
}

function handleVar(name, line, value){
    if (!(name in input_vector)) {
        ifFunction(name, value);
    }
}

function ifFunction(name, value){
    if (isFunction) {
        if (isWhile)
            while_map[name] = value;
        else if (isLoop)
            tmp_map[name] = value;
        else
            var_map[name] = value;
    }
    else input_vector[name] = '';
}

function iterateEquation(value){
    if (nusOfLiterals(value)>1) {
        if (!value.includes('*') && !value.includes('/')) {
            return doSomething(value);
        }
        else
            return elseDoSomething(value);
    }
    return value;
}

function doSomething(value){
    let str = value;
    let ans = value;
    let res = '';
    for (var i = 0; i < str.length; i++) {
        str = deleteParts(false, str, i);
    }
    try {
        res = eval(str);
    } catch (e) {
        return value;
    }
    for (var j = 0; j < ans.length; j++) {
        ans = deleteParts(true, ans, j);
    }
    if (check(ans, ans.length - 2))
        ans = ans + ' + ';
    res = ans + res;
    return res;
}

function elseDoSomething(value){
    if (value.includes('*'))
        return doSomething(value.substring(0, value.indexOf('*'))) + doSomething(value.substring(value.indexOf('*'), value.length));
    else if (value.includes('/'))
        return doSomething(value.substring(0, value.indexOf('/'))) + doSomething(value.substring(value.indexOf('/'), value.length));
}

function nusOfLiterals(value){
    let count = 0;
    for (var i = 0; i<value.length; i++){
        if (!isNaN(parseInt(value[i], 10)))
            count++;
    }
    return count;
}

function deleteParts(isNumber, str, i){
    if(!isNumber) {
        str = deleteLetter(str,i);
    }
    else{
        str = deleteNum(str,i);
    }
    return str;
}

function deleteLetter(str, i){
    if (isNaN(parseInt(str[i], 10))) {
        if (toDelete(str,i)) {
            if ((i + 4) < str.length)
                str = str.substring(0, i) + str.substring(i + 3, str.length);
            else
                str = str.substring(0, i-3);
        }
        else return str;
    }
    return str;
}
function deleteNum(str, i){
    if (!isNaN(parseInt(str[i], 10))) {
        if ((i + 4) < str.length)
            str = str.substring(0, i) + str.substring(i + 3, str.length);
        else
            str = str.substring(0, i);
    }
    return str;
}

function toDelete(str,i){
    if (str[i] != ' ' && str[i] != '(' && str[i] != ')')
        return check(str,i);
    else return false;
}

function check(str,i){
    if (str[i] != '/' && str[i] != '-' && str[i] != '+' && str[i] != '*')
        return true;
    else return false;
}

function iterateExpression(expressionElement) {
    if (expressionElement.type == 'Literal')
        return expressionElement.value;
    else {
        let value;
        let func = expressionTypeMapping[expressionElement.type];
        value = func ? func.call(undefined, expressionElement) : '';
        return replaceVar(value);
    }
}

function iterateExpressionForVariable(expressionElement) {
    if (expressionElement.type == 'Literal')
        return expressionElement.value;
    else {
        let func = expressionTypeMapping[expressionElement.type];
        return func ? func.call(undefined, expressionElement) : '';
    }
}

function whileStatement(json) {
    var cond = handleCondition(json.test);
    let line = 'while (' + cond + ')';
    if (json.body.type == 'BlockStatement')
        line = line + ' {';
    printLine(line);

    while_map = copyWhile();
    isWhile = true;
    iterateBlock(json.body);
    if(json.body.type == 'BlockStatement') {
        nextLine();
        let line = '}';
        printLine(line);
    }
    isWhile = false;
}

function ifStatement(json, isElse){
    let cond = handleCondition(json.test);
    let line;
    if (!isElse) line = 'if (' + cond + ')';
    else line = 'else if (' + cond + ')';
    if (json.consequent.type == 'BlockStatement')
        line = line + ' {';
    else nextLine();
    printLine(line);
    tmp_map = copy();
    isLoop = true;
    iterateBlock(json.consequent);
    if(json.consequent.type == 'BlockStatement') {
        printClose();
    }
    if (json.alternate) alternate(json);
    isLoop = false;
}

function printClose(){
    if (!(data_array[line_number+1].includes('}'))) {
        let line = '}';
        printLine(line);
    }
}

function copy(){
    tmp_map = {};
    for (var i in var_map){
        let val = var_map[i];
        tmp_map[i] = val;
    }
    return tmp_map;
}

function copyWhile(){
    while_map = {};
    for (var i in var_map){
        let val = var_map[i];
        while_map[i] = val;
    }
    return while_map;
}

function elseIfStatement(json) {
    ifStatement(json, true);
}

function handleCondition(test) {
    return iterateExpression(test);
}

function alternate(json){
    nextLine();
    if (json.alternate.type == 'IfStatement')
        elseIfStatement(json.alternate);
    else{
        result.push(data_array[line_number]);
        if(json.alternate.type != 'BlockStatement')
            nextLine();
        tmp_map = copy();
        iterateBlock(json.alternate, true);
        if(json.alternate.type == 'BlockStatement') {
            nextLine();
            let line = '}';
            printLine(line);
        }
    }
}

function ReturnStatement(json) {
    var value;
    if (json.argument.type == 'Identifier') {
        value = json.argument.name;
        value = replaceVar(value);
    }
    else
        value = iterateExpression(json.argument);
    let line = 'return ' + value +';';
    printLine(line);
}

function BinaryExpression(json){
    var left = iterateLeft(json);
    var op = json.operator;
    var right = iterateRight(json);

    var ans;
    if (op == '*' || op == '/')
        ans = '(' + left + ') ' + op + ' ' + right;
    else
        ans = left + ' ' + op + ' ' + right;
    return ans;
}

function iterateLeft(json){
    var left;
    if (json.left.name)
        left = json.left.name;
    else if (json.left.value)
        left = json.left.value;
    else
        left = iterateExpression(json.left);
    return left;
}

function iterateRight(json){
    var right;
    if (json.right.name)
        right = json.right.name;
    else if(json.right.value)
        right = json.right.value;
    else
        right = iterateExpression(json.right);
    return right;
}

function UnaryExpression(json) {
    var op = json.operator;
    var value = iterateExpression(json.argument);
    return (op + value);
}

function UpdateExpression(expressionElement) {
    var name = expressionElement.argument.name;
    name = replaceVar(name);
    var op = expressionElement.operator;
    if (expressionElement.prefix)
        return (op + name);
    else
        return (name + op);
}

function MemberExpression(json){
    var object = json.object.name;
    var property;
    if (json.property.name) {
        property = json.property.name;
        property = replaceVar(property);
    }
    else
        property = iterateExpression(json.property);
    return (object + '[' + property + ']');
}

function replaceVar(value){
    let original_value = value;
    value = subOp(value);
    let array = value.split(' ');
    for (var i in array){
        if(!isLoop) {
            if (!isWhile)
                value = replaceTheVar(var_map, value, array, i);
            else value = replaceTheVar(while_map, value, array, i);
        }
        else{
            if (isWhile)
                value = replaceTheVar(while_map, value, array, i);
            else value = replaceTheVar(tmp_map, value, array, i);
        }
    }
    value = close(value);
    var ans = value.replace(original_value,value);
    return ans;
}

function close(value){
    if (!(data_array[line_number].includes('if')) && !(data_array[line_number].includes('while')))
        value = deleteSpaces(value);
    return value;
}

function subOp(value){
    if (data_array[line_number].includes('if') || data_array[line_number].includes('while'))
        value = subValue(value);
    else {
        value = func(value);
    }
    return value;
}

function func(value){
    for (var i = 0; i < value.length; i++){
        if (value[i] == '(')
            value = value.substring(0,i+1) + ' ' + value.substring(i+1,value.length);
        else if (value[i] == ')') {
            value = value.substring(0, i) + ' ' + value.substring(i, value.length);
            i++;
        }
    }
    return value;
}

function deleteSpaces(value){
    let str = value;
    for (var i = 0; i < str.length; i++){
        if (str[i] == '(')
            str = str.substring(0,i+1) + str.substring(i+2,str.length);
        else if (str[i] == ')')
            str = str.substring(0,i-1) + str.substring(i,str.length);
    }
    return str;
}

function replaceTheVar(arr, value, array, i){
    if (array[i] in arr) {
        let loc = array[i];
        let newLoc = arr[loc];
        var res = value.replace(loc, newLoc);
        value = res;
    }
    return value;
}

function subValue(value){
    let idx1 = value.indexOf('(');
    if (idx1 != -1){
        let str1 = value.substring(0,idx1);
        let str2 = value.substring(idx1+1,value.length);
        value = str1 + str2;
    }
    let idx2 = value.indexOf(')');
    if (idx2 != -1){
        let str3 = value.substring(0,idx2);
        let str4 = value.substring(idx2+1,value.length);
        value = str3 + str4;
    }
    return value;
}

function nextLine(){
    line_number++;
    if (!data_array[line_number].replace(/\s/g, '').length)
        line_number++;
}

function printLine(line){
    let arr = data_array[line_number].split(' ');
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == '')
            line = ' ' + line;
    }
    result.push(line);
}
