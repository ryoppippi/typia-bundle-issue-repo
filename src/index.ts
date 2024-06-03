import typia, { type tags } from "typia";
interface Author {
  name: string;
  age: number &
    tags.Type<"uint32"> &
    tags.Minimum<20> &
    tags.ExclusiveMaximum<100>;
}
const validate = typia.createValidate<Author>();
console.log(validate({ name: "John", age: 30 }));
