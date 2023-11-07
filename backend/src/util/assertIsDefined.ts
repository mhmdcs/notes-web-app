
// this generic util function allows us to pass any value of any type to it, and then it will check that this value is not null or undefined, and then on the outside when the caller uses this function, we get the non-nullable type value back, or this function will throw an error if the value IS null/undefined
export function assertIsDefined<T>(val: T): asserts val is NonNullable<T>{
    if (!val) {
        throw Error("Expect a value of non-nullable type, but received " + val); 
    }
}
// instead of defining a normal type after the : after the function's signature, we instead define `asserts val is NonNullable<T>` as the type
// why do we use a generic T type instead of `any` type? because we want to return a value that's guaranteed to be not-null, and `any` could be null/undefined 


/*
The syntax we're looking at with the assertIsDefined() function in TypeScript is for a generic function with a type predicate as its return type. Let's break it down:

1. Generic Function `<T>`:
   - The `<T>` syntax denotes that the function is generic, which means it can work with any type. `T` is a type variable that will be determined based on the argument passed to the function when it's called.

2. Parameter `(val: T)`:
   - `val` is the parameter of the function, and its type is `T`, the generic type variable we just talked about. This means `val` can be of any type that the caller passes in.

3. Type Predicate `asserts val is NonNullable<T>`:
   - The `asserts` keyword is used to tell TypeScript that the function is an assertion function. It asserts that a certain condition holds true after the function returns.
   - `val is NonNullable<T>` is a type predicate. It's like a type guard that informs TypeScript about the type of a variable. In this case, it tells TypeScript that `val` is not `null` or `undefined`.
   - `NonNullable<T>` is a utility type that represents all values of `T` except `null` and `undefined`.

So, putting it all together, `assertIsDefined<T>(val: T): asserts val is NonNullable<T>` declares a generic assertion function that takes one argument `val` of any type `T` and asserts that after this function is called, `val` cannot be `null` or `undefined`.

Here's how it works:

- When you call `assertIsDefined(someValue)`, the function checks if `someValue` is neither `null` nor `undefined`.
- If `someValue` is `null` or `undefined`, the function throws an error.
- If `someValue` is not `null` or `undefined`, the function returns without a value, but it has the side effect of letting TypeScript know that `someValue` is now guaranteed to be neither `null` nor `undefined` from that point forward in the code.

By using this assertion function, you can ensure that variables you work with are not null or undefined without having to check them explicitly each time, and you help TypeScript narrow down the type accordingly.
*/