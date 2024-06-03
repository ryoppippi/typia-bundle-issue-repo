import typia, { type tags } from "typia";
interface Author {
    name: string;
    age: number & tags.Type<"uint32"> & tags.Minimum<20> & tags.ExclusiveMaximum<100>;
}
const validate = (input: any): typia.IValidation<Author> => {
    const errors = [] as any[];
    const __is = (input: any): input is Author => {
        return "object" === typeof input && null !== input && ("string" === typeof (input as any).name && ("number" === typeof (input as any).age && (Math.floor((input as any).age) === (input as any).age && 0 <= (input as any).age && (input as any).age <= 4294967295 && 20 <= (input as any).age && (input as any).age < 100)));
    };
    if (false === __is(input)) {
        const $report = (typia.createValidate as any).report(errors);
        ((input: any, _path: string, _exceptionable: boolean = true): input is Author => {
            const $vo0 = (input: any, _path: string, _exceptionable: boolean = true): boolean => ["string" === typeof input.name || $report(_exceptionable, {
                    path: _path + ".name",
                    expected: "string",
                    value: input.name
                }), "number" === typeof input.age && (Math.floor(input.age) === input.age && 0 <= input.age && input.age <= 4294967295 || $report(_exceptionable, {
                    path: _path + ".age",
                    expected: "number & Type<\"uint32\">",
                    value: input.age
                })) && (20 <= input.age || $report(_exceptionable, {
                    path: _path + ".age",
                    expected: "number & Minimum<20>",
                    value: input.age
                })) && (input.age < 100 || $report(_exceptionable, {
                    path: _path + ".age",
                    expected: "number & ExclusiveMaximum<100>",
                    value: input.age
                })) || $report(_exceptionable, {
                    path: _path + ".age",
                    expected: "(number & Type<\"uint32\"> & Minimum<20> & ExclusiveMaximum<100>)",
                    value: input.age
                })].every((flag: boolean) => flag);
            return ("object" === typeof input && null !== input || $report(true, {
                path: _path + "",
                expected: "Author",
                value: input
            })) && $vo0(input, _path + "", true) || $report(true, {
                path: _path + "",
                expected: "Author",
                value: input
            });
        })(input, "$input", true);
    }
    const success = 0 === errors.length;
    return {
        success,
        errors,
        data: success ? input : undefined
    } as any;
};
console.log(validate({ name: "John", age: 30 }));
