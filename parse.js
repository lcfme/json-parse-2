(function(global, factory) {
    if (typeof module == 'object' && typeof module.exports == 'object') {
        module.exports = factory();
    } else {
        global.parse = factory();
    }
})(this, function() {
    return function parse(program) {
        var program = program || '',
            at = 0;
        var result = value();
        skip();
        while (/^\//.test(program)) {
            skipComment();
            skip();
        }
        if (program)
            throw new SyntaxError(
                'Unexpected input at ' + at + ', ' + program.slice(0, 10)
            );
        return result;
        function value() {
            skip();
            while (/^\//.test(program)) {
                skipComment();
                skip();
            }
            if (program[0] == '{') return parseObject();
            else if (program[0] == '[') return parseArray();
            else if (/^[\d.]/.test(program)) return parseNumber();
            else if (/^["']/.test(program)) return parseString();
            else if (/^[\w$]/.test(program)) return parseWord();
            else
                throw new SyntaxError(
                    'Unexpected input at ' + at + ', ' + program.slice(0, 10)
                );
        }
        function skip(pos) {
            var temp = program;
            pos = pos === parseInt(pos, 10) ? pos : program.search(/\S/);
            if (pos == -1) {
                program = '';
                return temp;
            }
            program = program.substr(pos);
            return temp.slice(0, pos);
        }

        function parseString() {
            var startSign = program[0],
                match,
                ch,
                regExp = new RegExp('^' + startSign + '(.*)' + startSign);
            match = program.match(regExp);
            if (!match)
                throw new SyntaxError(
                    'Unexpected input at ' + at + ', ' + program.slice(0, 10)
                );
            skip(match[0].length);
            return match[1];
        }

        function parseNumber() {
            var regExp = /^[\d.]+/,
                match,
                number;
            match = program.match(regExp);
            if (!match)
                throw new SyntaxError(
                    'Unexpected input at ' + at + ', ' + program.slice(0, 10)
                );
            number = Number(match[0]);
            if (isNaN(number))
                throw new SyntaxError(
                    'Unexpected input at ' + at + ', ' + program.slice(0, 10)
                );
            skip(match[0].length);
            return number;
        }

        function parseWord(treatAsString) {
            var regExp = /^[\w$]+/,
                match,
                word;
            match = program.match(regExp);
            if (!match)
                throw new SyntaxError(
                    'Unexpected input at ' + at + ', ' + program.slice(0, 10)
                );
            skip(match[0].length);
            if (treatAsString) return match[0];
            switch (match[0]) {
                case 'true':
                    return true;
                case 'false':
                    return false;
                case 'null':
                    return null;
                default:
                    throw new SyntaxError(
                        'Unexpected input at ' +
                            at +
                            ', ' +
                            program.slice(0, 10)
                    );
            }
        }

        function skipComment() {
            var regExp1 = /^\/\*[^]*\*\//,
                regExp2 = /^\/\/(.*)\n/,
                match;
            match = program.match(regExp1) || program.match(regExp2);
            if (!match)
                throw new SyntaxError(
                    'Unexpected input at ' + at + ', ' + program.slice(0, 10)
                );
            skip(match[0].length);
        }

        function parseObject() {
            var o = {},
                _key,
                _value;
            skip(1);
            skip();
            while (program[0] != '}') {
                if (/^["']/.test(program)) _key = parseString();
                else if (/^[\w$]/.test(program)) _key = parseWord(true);
                else
                    throw new SyntaxError(
                        'Unexpected input at ' +
                            at +
                            ', ' +
                            program.slice(0, 10)
                    );
                skip();
                if (program[0] != ':')
                    throw new SyntaxError(
                        'Unexpected input at ' +
                            at +
                            ', ' +
                            program.slice(0, 10)
                    );
                skip(1);
                _value = value();
                if (program[0] == ',') skip(1);
                else if (program[0] != '}')
                    throw new SyntaxError(
                        'Unexpected input at ' +
                            at +
                            ', ' +
                            program.slice(0, 10)
                    );
                o[_key] = _value;
            }
            skip(1);
            return o;
        }

        function parseArray() {
            var arr = [];
            skip(1);
            skip();
            while (program[0] != ']') {
                arr.push(value());
                skip();
                if (program[0] == ',') skip(1);
                else if (program[0] != ']')
                    throw new SyntaxError(
                        'Unexpected input at ' +
                            at +
                            ', ' +
                            program.slice(0, 10)
                    );
            }
            skip(1);
            return arr;
        }
    };
});
