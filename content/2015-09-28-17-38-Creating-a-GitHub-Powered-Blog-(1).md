# Creating a GitHub Powered Blog (1 / 3)

_In this series of articles I'll explain how to create a GitHub-powered single-page blog such as this one - using [Haxe][1]!_

_This entry deals with the planning process and project setup._

## Planning

The idea, in a nutshell, is to utilise the GitHub API to request the contents of a repository, and display response data on the site.

For this project, I'll assume there's a [GitHub Pages][2] repository ready to use. But any repository should do fine for hosting content.

The **first step** is to outline the information to show on the site. Some basic user information and a list of articles the visitor could peruse is enough. This requires the API to:

* [get a single user][3];
* [get repository contents][4].

The content repository will have a simple structure - one directory will store all articles. Something more complex would have to rely on [recursively obtaining the tree][5].

With the API URLs in place, the **second step** is to call upon them to request the required data. Haxe can handle HTTP requests consistently across platforms with use of the [haxe.Http][6] class. There's not much else to this step.

The **final step** is to deal with the received data. API responses should be formatted before being displayed on the site - doing this manually would be a bit cumbersome. Fortunately, Haxe has a [built-in template system][7]! The template system can be leveraged to create views for API response data. These views can then be _injected_ in the base site template.

## Summary

The GitHub powered blog relies on two simple GitHub API calls to fetch necessary data: one to request [user information][3], the other to request [repository contents][4].

API requests are handled by the [haxe.Http][6] class. Responses are, after parsing, rendered into HTML with [Haxe's template system][7].

The next entry in this series will deal with creating a skeleton framework which will handle the routing of our single-page blog.

Until next time,

_Domagoj_

[1]: http://www.haxe.org/
[2]: https://pages.github.com/
[3]: https://developer.github.com/v3/users/#get-a-single-user
[4]: https://developer.github.com/v3/repos/contents/#get-contents
[5]: https://developer.github.com/v3/git/trees/
[6]: http://api.haxe.org/haxe/Http.html
[7]: http://haxe.org/manual/std-template.html