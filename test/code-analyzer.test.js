import assert from 'assert';
import {parseCode} from '../src/js/code-analyzer';

describe('The javascript parser', () => {
    testEmpty();
    testIfs();
    testWhile();
    testArr();
    testBoolean();
    testGlobalChange();
    testArrPlace();
    testFunc();
    testGlobal();
    testNull();
    testNewArray();
    testSwitch();
    testIdentifier();
    testUpdate();
    testExpression();
    testGlobalExpression();
    testParenthesis();
    testPrefix();
    testIf();
    testValue();
    testToDelete();
});

function testEmpty(){
    it('is parsing an empty function correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('')),
            '[]'
        );
    });
}

function testIfs(){
    it('is parsing a if loop correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    if (b < z) {\n' +
                '        c = c + 5;\n' +
                '        return x + y + z + c;\n' +
                '    } else if (b < z * 2) {\n' +
                '        c = c + x + 5;\n' +
                '        return x + y + z + c;\n' +
                '    } else {\n' +
                '        c = c + z + 5;\n' +
                '        return x + y + z + c;\n' +
                '    }\n' +
                '}\n')),
            '[' +
            '"function foo(x, y, z){",' +
            '"    if (x + 1 + y < z) {",' +
            '"        return x + y + z + 5;",' +
            '"    else if (x + 1 + y < z * 2) {",' +
            '"        return x + y + z +  x + 5;",' +
            '"    } else {",' +
            '"        return x + y + z +  z + 5;",' +
            '"    }",' +
            '"}"' +
            ']'
        );
    });
}

function testWhile(){
    it('is parsing a while loop correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    while (a < z) {\n' +
                '        c = a + b;\n' +
                '        z = c * 2;\n' +
                '    }\n' +
                '    \n' +
                '    return z;\n' +
                '}\n')),
            '[' +
            '"function foo(x, y, z){",' +
            '"    while (x + 1 < z) {",' +
            '"        z = (x + 1 + x + 1 + y) * 2;",' +
            '"    }",' +
            '"    return z;",' +
            '"}"' +
            ']'
        );
    });
}

function testArr(){
    it('is parsing an array correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    x[0] = 0;\n' +
                '    \n' +
                '    if (b < z) {\n' +
                '        x[0] = x[0] + 5;\n' +
                '        return x + y + z + x[0];\n' +
                '    } else if (b < z * 2) {\n' +
                '        x[0] = x[0] + x + 5;\n' +
                '        return x + y + z + x[0];\n' +
                '    } else {\n' +
                '        x[0] = x[0] + z + 5;\n' +
                '        return x + y + z + x[0];\n' +
                '    }\n' +
                '}\n')),
            '[' +
            '"function foo(x, y, z){",' +
            '"    x[0] = 0;",' +
            '"    if (x + 1 + y < z) {",' +
            '"        x[0] = 5;",' +
            '"        return x + y + z + 5;",' +
            '"    else if (x + 1 + y < z * 2) {",' +
            '"        x[0] =  x + 5;",' +
            '"        return x + y + z +  x + 5;",' +
            '"    } else {",' +
            '"        x[0] =  z + 5;",' +
            '"        return x + y + z +  z + 5;",' +
            '"    }",' +
            '"}"' +
            ']'
        );
    });
}

function testBoolean(){
    it('is parsing a boolean statement correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let found = true;\n' +
                '    \n' +
                '    if (found) {\n' +
                '        z = z + 5;\n' +
                '        return x + y + z + z;\n' +
                '    } else if (!found) {\n' +
                '        b = b + x + 5;\n' +
                '        return x + y + z + b;\n' +
                '    } else {\n' +
                '        b = b + z + 5;\n' +
                '        return x + y + z + b;\n' +
                '    }\n' +
                '}\n')),
            '[' +
            '"function foo(x, y, z){",' +
            '"    if () {",' +
            '"        z = z + 5;",' +
            '"        return x + y + z + z;",' +
            '"    else if (!) {",' +
            '"        return x + y + z + x +  y + x + 6;",' +
            '"    } else {",' +
            '"        return x + y + z + x +  y + z + 6;",' +
            '"    }",' +
            '"}"' +
            ']'
        );
    });
}

function testGlobalChange(){
    it('is parsing a global again correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    let x = 8;\n' +
                '}\n')),
            '[' +
            '"function foo(x, y, z){",' +
            '"    let x = 8;",' +
            '"}"' +
            ']'
        );
    });
}

function testArrPlace(){
    it('is parsing a local with array variable correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = z[3];\n' +
                '}\n')),
            '[' +
            '"function foo(x, y, z){",' +
            '"}"' +
            ']'
        );
    });
}

function testFunc(){
    it('is parsing an empty function correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('function binarySearch(X, V, n){\n' +
                '    let low, high, mid;\n' +
                '    low = 0;\n' +
                '    high = n - 1;\n' +
                '    while (low <= high) {\n' +
                '        mid = (low + high)/2;\n' +
                '        if (X < V[mid])\n' +
                '            high = mid - 1;\n' +
                '        else if (X > V[mid])\n' +
                '            low = mid + 1;\n' +
                '        else\n' +
                '            return mid;\n' +
                '    }\n' +
                '    return -1;\n' +
                '}')),
            '[' +
            '"function binarySearch(X, V, n){",' +
            '"    while (0 <= n - 1) {",' +
            '"            if (X < V[ n - 1/ 2])",' +
            '"            else if (X > V[ n - 1/ 2])",' +
            '"        else",' +
            '"            return (n - 1/ 2;",' +
            '"    }",' +
            '"    return -1;",' +
            '"}"' +
            ']'
        );
    });
}

function testGlobal(){
    it('is parsing a global correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('let t = 5;\n' +
                'function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    while (a < z) {\n' +
                '        c = a + b;\n' +
                '        z = c * 2;\n' +
                '    }\n' +
                '    \n' +
                '    return t;\n' +
                '}\n')),
            '[' +
            '"let t = 5;",' +
            '"function foo(x, y, z){",' +
            '"    while (x + 1 < z) {",' +
            '"        z = (x + 1 + x + 1 + y) * 2;",' +
            '"    }",' +
            '"    return t;",' +
            '"}"' +
            ']'
        );
    });
}

function testNull(){
    it('is parsing a global correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('let t = null;\n' +
                'function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = null;\n' +
                '    \n' +
                '    while (a < z) {\n' +
                '        c = a + b;\n' +
                '        z = c * 2;\n' +
                '    }\n' +
                '    \n' +
                '    return t;\n' +
                '}\n')),
            '[' +
            '"let t = null;",' +
            '"function foo(x, y, z){",' +
            '"    while (x + 1 < z) {",' +
            '"        z = (x + 1 + x + 1 + y) * 2;",' +
            '"    }",' +
            '"    return t;",' +
            '"}"' +
            ']'
        );
    });
}

function testNewArray(){
    it('is parsing a global correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('let t = null;\n' +
                'function foo(x, y, z){\n' +
                '    let a = new array(5);\n' +
                '    return t;\n' +
                '}\n')),
            '[' +
            '"let t = null;",' +
            '"function foo(x, y, z){",' +
            '"    return t;",' +
            '"}"' +
            ']'
        );
    });
}

function testSwitch(){
    it('is parsing a switch case correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('function foo(x, y, z){\n' +
                '    switch(x) {\n' +
                '        case y:\n' +
                '            a = 8;\n' +
                '        case z:\n' +
                '            a = 5;\n' +
                '        default:\n' +
                '            a = 0;\n' +
                '    }\n' +
                '}\n')),
            '[' +
            '"function foo(x, y, z){",' +
            '"}"' +
            ']'
        );
    });
}

function testIdentifier(){
    it('is parsing an identifier correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('function foo(x, y, z){\n' +
                '    let a = x\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    while (a < z) {\n' +
                '        c = a + b;\n' +
                '        z = c * 2;\n' +
                '    }\n' +
                '    \n' +
                '    return z;\n' +
                '}\n' +
                '\n')),
            '[' +
            '"function foo(x, y, z){",' +
            '"    while (x < z) {",' +
            '"        z = (x + x + y) * 2;",' +
            '"    }",' +
            '"    return z;",' +
            '"}"' +
            ']'
        );
    });
}

function testUpdate(){
    it('is parsing an update correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    while (a < z) {\n' +
                '        c++;\n' +
                '        z = c * 2;\n' +
                '    }\n' +
                '    \n' +
                '    return t;\n' +
                '}\n')),
            '[' +
            '"function foo(x, y, z){",' +
            '"    while (x + 1 < z) {",' +
            '"        z = 2;",' +
            '"    }",' +
            '"    return t;",' +
            '"}"' +
            ']'
        );
    });
}

function testExpression(){
    it('is parsing an expression correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('function foo(x, y, z){\n' +
                '    let a = x;\n' +
                '    let b = a + y;\n' +
                '    a + b;\n' +
                '    \n' +
                '    return z;\n' +
                '}\n')),
            '[' +
            '"function foo(x, y, z){",' +
            '"    return z;",' +
            '"}"' +
            ']'
        );
    });
}

function testGlobalExpression(){
    it('is parsing a global expression correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('x + y;\n' +
                'function foo(x, y, z){\n' +
                '    let a = x;\n' +
                '    let b = a + y;\n' +
                '    \n' +
                '    return z;\n' +
                '}\n')),
            '[' +
            '";",' +
            '"function foo(x, y, z){",' +
            '"    return z;",' +
            '"}"' +
            ']'
        );
    });
}

function testParenthesis(){
    it('is parsing a global expression correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    while (a < z)\n' +
                '        c = a + b;\n' +
                '    \n' +
                '    return z;\n' +
                '}\n')),
            '[' +
            '"function foo(x, y, z){",' +
            '"    while (x + 1 < z)",' +
            '"        return z;",' +
            '"}"' +
            ']'
        );
    });
}

function testPrefix(){
    it('is parsing a prefix correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    while (a < z)\n' +
                '        ++c;\n' +
                '    \n' +
                '    return z;\n' +
                '}\n')),
            '[' +
            '"function foo(x, y, z){",' +
            '"    while (x + 1 < z)",' +
            '"        return z;",' +
            '"}"' +
            ']'
        );
    });
}

function testIf(){
    it('is parsing a if loop correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    if (b < z) {\n' +
                '        c = c + 5;\n' +
                '        return x + y + z + c;\n' +
                '    } \n' +
                '    else if (b < z * 2) {\n' +
                '        c = c + x + 5;\n' +
                '        return x + y + z + c;\n' +
                '    }\n' +
                '}\n')),
            '[' +
            '"function foo(x, y, z){",' +
            '"    if (x + 1 + y < z) {",' +
            '"        return x + y + z + 5;",' +
            '"     else if (x + 1 + y < (z) * 2) {",' +
            '"        return x + y + z +  x + 5;",' +
            '"        }",' +
            '"}"' +
            ']'
        );
    });
}

function testValue(){
    it('is parsing a value correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('function foo(x, y, z){\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    if (c < z) {\n' +
                '        c = 5 + c;\n' +
                '        return x + y + z + c;\n' +
                '    } \n' +
                '}\n')),
            '[' +
            '"function foo(x, y, z){",' +
            '"    if (0 < z) {",' +
            '"        return x + y + z + 5;",' +
            '"}"' +
            ']'
        );
    });
}


function testToDelete(){
    it('is parsing a not correct function correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('function foo(x, y, z){\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    if (b < z) {\n' +
                '        c = c + -5;\n' +
                '        return x + y + z + c;\n' +
                '    } \n' +
                '}\n')),
            '[' +
            '"function foo(x, y, z){",' +
            '"    if (a + y < z) {",' +
            '"        return x + y + z + 5;",' +
            '"}"' +
            ']'
        );
    });
}
