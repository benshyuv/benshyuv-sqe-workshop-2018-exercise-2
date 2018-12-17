import $ from 'jquery';
import {parseCode} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);

        let variablesValue = $('#variablesArea').val();
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
        variablesValues(variablesValue, parsedCode);
    });
});

function variablesValues(variablesValue, parsedCode){
    let variables_arr = variablesValue.split('\n');
    let variables_map = {};
    for (var i = 0; i<variables_arr.length; i++){
        let idx1 = variables_arr[i].indexOf('=');
        let name = variables_arr[i].substring(0,idx1-1);
        let value = variables_arr[i].substring(idx1+1,variables_arr[i].length);
        variables_map[name]=value;
    }
    createColors(parsedCode, variables_map);
}

function createColors(parsedCode, variables_map) {
    let toColor = document.getElementById('outputColoredCode');
    while (toColor.childNodes.length != 0)
        toColor.removeChild(toColor.childNodes[0]);
    for (var i = 0; i<parsedCode.length; i++) {
        parsedCode[i] = replaceAll(parsedCode[i], '    ', '&nbsp;&nbsp;&nbsp;&nbsp;');
        parsedCode[i] = '<p &&&rownum&&&>' + parsedCode[i] + '</p>';
        parsedCode[i] = colorCond(parsedCode[i], variables_map);
        $('#outputColoredCode').append(parsedCode[i]);
    }
}

function colorCond(value, variables_map){
    if (value.includes('if')) {
        let val = replaceVar(value, variables_map);
        val = deleteParenthesis(val);
        var resultCond = eval(val);
        if (resultCond)
            value = value.replace('&&&rownum&&&', '<mark style="background-color: green"</mark>');
        else
            value = value.replace('&&&rownum&&&', '<mark style="background-color: red"</mark>');
    }
    return value;
}

function replaceAll(res, toReplace, newReplace){
    while (res.includes(toReplace))
        res = res.replace(toReplace, newReplace);
    return res;
}

function deleteParenthesis(val){
    for (var i = 0; i < val.length; i++){
        if (val[i] == '(') {
            val = val.substring(i + 1, val.length);
            i = 0;
        }
        else if (val[i] == ')')
            val = val.substring(0,i);
    }
    return val;
}

function replaceVar(value, variables_map){
    let original_value = value;
    value = func(value);
    let array = value.split(' ');
    for (var i in array){
        value = replaceTheVar(variables_map, value, array, i);
    }
    value = deleteSpaces(value);
    var ans = value.replace(original_value,value);
    return ans;
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
