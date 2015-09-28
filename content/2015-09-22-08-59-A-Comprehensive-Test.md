# A Comprehensive Test

## General stuff

Okay, so, this seems to work. _Let's test the markup_. Here are some bullet points:

* Point one;
* Point two.

Here's an ordered list:

1. Item one;
2. Item two;
3. Item three.

## Code stuff

**It's time to code**. The function `trace()` logs passed arguments to the target's debug output. Here's an example:

```haxe
class TraceTest
{
    public static function main()
    {
        trace('Hello!');
        trace(42);
        trace(['a', 'b', 3, true]);
        trace({ name : 'Bob', age : 10 });
    }
}
```

Links should work as well. For instance, [this](http://daringfireball.net/projects/markdown/syntax) should point to the Markdown syntax specification. Let's see if the altnerate syntax works as well for [this][1], and [this][2].

[1]: http://google.com
[2]: http://yahoo.com

## Other

Quotes look like this:

> Cthulhu fhtagn!

Images, like this:

![A dog I found on Google image search](http://www.butlercountyhs.org/Graphics/Dogs/ButlerHumaneSociety3.png)