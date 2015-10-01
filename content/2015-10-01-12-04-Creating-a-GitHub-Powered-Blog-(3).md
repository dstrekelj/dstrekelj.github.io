# Creating a GitHub Powered Blog (3 / 3)

_In this series of articles I'll explain how to create a GitHub-powered single-page blog such as this one - using [Haxe][1]! The repository is available [here](https://github.com/dstrekelj/gitblog)._

_This final entry makes use of the code and knowledge from previous articles to construct the final app. Some terminology relates to the [Model-View-Controller pattern][2]. To those of you unfamiliar with MVC, I recommend reading up on it._

## Base Application

It's time to begin building the application using the framework created in the previous article. The main class should instantiate an object of the `framework.App` class, to which the routes can be registered.

```haxe
// gitblog/GitBlog.hx
package gitblog;

import framework.App;

class GitBlog {
    public static function main() {
        new GitBlog();
    }

    public function new() {
        new App();
    }
}

```

The next step is to set up the routes. Two routes should be enough for a blog: one to handle the homepage, and the other to handle the articles.

```haxe
public function new() {
    new App()
        .route({
            path : ~/^\/$/,
            controller : new gitblog.controllers.HomeController()
        })
        .route({
            path : ~/^\/contents\/(.*)$/,
            controller : new gitblog.controllers.ContentsController()
        });
}
```

As described in the second article of this series, a route consists of a path (as a [regular expression][3]) and a controller. Hence passing the `{ path : ..., controller : ... }` object as the argument.

Note that the articles route uses the "/contents/" fragment. The [GitHub API][4] method to get contents of a repository uses that fragment as a _base_. The path to a file or folder in the repository is then appended to that base fragment to get its  contents.

Making the app's route match that convention will make HTTP requests simpler. Passing the current hash along with the base request URL will be enough to get the desired response.

### Pretty HTTP Requests

_This is an optional step. The code going forward relies on it, but it can be worked around._

Before proceeding further I'll quickly "wrap" the [`haxe.Http`][5] class into something more user-friendly. The wrapper class, `Connection`, will essentially allow method chaining.

```haxe
// gitblog/Connection.hx
package gitblog;

class Connection extends haxe.Http {
    var baseURL : String;

    public function new(baseURL : String) {
        this.baseURL = baseURL;
        super(this.baseURL);
    }

    public function get() : Void {
        super.request(false);
    }

    public function onChange(callback : Int->Void) : Connection {
        this.onStatus = callback;
        return this;
    }

    public function onFailure(callback : String->Void) : Connection {
        this.onError = callback;
        return this;
    }

    public function onSuccess(callback : String->Void) : Connection {
        this.onData = callback;
        return this;
    }

    public function parameters(params : String) : Connection {
        this.url = baseURL + params;
        return this;
    }

    public function post() : Void {
        super.request(true);
    }
}
```

This makes it easier to set up callback functions for possible request results.

## Models

To this application, **models** are _data structures_. They are simple classes, defining some properties and a constructor. Models should therefore only assign values to variables and be devoid of all logic.

Three models are necessary: a user information model, a model for articles in the articles list, and a model for the currently viewed article.

Note the use of type definitions for constructor parameters. This is not required, but it's good practice with longer parameter lists.

### User

This model describes the user information to be displayed on the page.

```haxe
// gitblog/models/UserModel.hx
package gitblog.models;

class UserModel {
    public var avatar : String;
    public var email : String;
    public var location : String;
    public var login : String;
    public var name : String;
    public var repos : Int;
    public var url : String;

    public function new(params : UserModelParams) {
        avatar = params.avatar;
        email = params.email;
        location = params.location;
        login = params.login;
        name = params.name;
        repos = params.repos;
        url = params.url;
    }
}

typedef UserModelParams = {
    var avatar : String;
    var email : String;
    var location : String;
    var login : String;
    var name : String;
    var url : String;
    var repos : Int;
}
```

### Articles

This model describes an entry in the list of articles shown on the page.

```haxe
// gitblog/models/ArticlesModel.hx
package gitblog.models;

class ArticlesModel {
    public var timestamp : String;
    public var title : String;
    public var path : String;

    public function new(params : ArticlesModelParams) {
        timestamp = params.timestamp;
        title = params.title;
        path = params.path;
    }
}

typedef ArticlesModelParams = {
    var timestamp : String;
    var title : String;
    var path : String;
}
```

### Article

This model describes the article viewed on the page.

```haxe
// gitblog/models/ArticleModel.hx
package gitblog.models;

class ArticleModel {
    public var body : String;
    public var timestamp : String;

    public function new(params : ArticleModelParams) {
        body = params.body;
        timestamp = params.timestamp;
    }
}

typedef ArticleModelParams = {
    var body : String;
    var timestamp : String;
}
```

## Templates

With the models defined, the view templates can be created - one for each model. **Templates** are - in this case - HTML layouts with designated spaces for the properties of a model that should be displayed. Many different templating systems are available, with many different syntaxes.

This application's templates will be handled by [Haxe's built-in templating system][6]. I won't detail their use in this article, so please refer to the manual entry for more information.

Templates will be embedded into the compiler output as [resources][7], so it won't be necessary to fetch them from an outside source. When executed, they will be loaded into a parent DOM element - as discussed in the previous article when creating the `framework.View` class.

I'll refer to the templates by the resource name I've given them: UserTemplate, ArticlesTemplate, ArticleTemplate.

### User

The user view template creates a short user description from model data.

```html
<!--templates/user.mtt-->
<img src="::user.avatar::"/>
<p>I am <span>::user.name::</span>, also known as <span>::user.login::</span>. I am a native of <span>::user.location::</span>. I have worked on many GitHub repositories - <span>::user.repos::</span> so far.</p>
<p>Leave a message at <span>::user.email::</span>, or visit my <a href="::user.url::">GitHub page</a>.</p>
```

### Articles

The articles view template creates an unordered list of articles in the response received from the GitHub API. Note the iteration.

```html
<!--templates/articles.mtt-->
<ul>
::foreach articles::
  <li><a href="#/contents/::__current__.path::">::__current__.title::</a><br/><span class="timestamp">::__current__.timestamp::</span></li>
::end::
</ul>
```

### Article

The article view template displays the article. Note the omission of HTML tags around the `article.body` property. HTML formatting of the article body is should be done before displaying it - either by writing it into the article, or by parsing another format to HTML output.

These articles will be written in [Markdown][8], but this is not a requirement. What is important is that there exists an awareness of what is _input_, and what is _output_.

```html
<!--templates/article.mtt-->
<div class="timestamp">Written on ::article.timestamp::</div>
::article.body::
```

## Views

Views were discussed in more detail when creating the framework, so I'll jump right into the code.

Three views are necessary, one for each model: a user view, a view for the list of articles, and a view for a single article. The `framework.View` class can be extended to save some time creating views, but it's fine to write your own implementation if you so desire.

### User

The user view will be rendered in the element of ID "user", using the "UserTemplate" resource.

Note that the view is updated with an object where the view data is represented by the `user` property. This is because of the user template syntax, e.g. `::user.name::`. The other views will be updated in the same fashion.

```haxe
// gitblog/views/UserView.hx
package gitblog.views;

import framework.View;

import gitblog.models.UserModel;

class UserView extends View {
    public function new() {
        super('user', 'UserTemplate');
    }

    override public function update(user : UserModel) : Void {
        super.update({ user : user });
    }
}
```

### Articles

The articles view will be rendered in the element of ID "articles", using the "ArticlesTemplate" resource.

Note that the data is formatted before the view is updated.

```haxe
// gitblog/views/ArticlesView.hx
package gitblog.views;

import framework.View;

import gitblog.models.ArticlesModel;

class ArticlesView extends View {
    public function new() {
        super('articles', 'ArticlesTemplate');
    }

    override public function update(articles : Array<ArticlesModel>) : Void {
        for (article in articles) {
            var date : String = article.timestamp.substr(0, 10);
            var time : String = article.timestamp.substr(11, 5).split('-').join(':');
            article.timestamp = date + ' @ ' + time;
            article.title = article.title.substring(17, article.title.length - 3).split('-').join(' ');
        }

        super.update({ articles : articles });
    }
}
```

### Article

The article view will be rendered in the element of ID "article", using the "ArticleTemplate" resource. Just like the articles view, data is formatted before updating the view's parent element.

Note the use of the `Markdown` class when parsing the article body. This is a dependency - the `markdown` Haxe library, in particular - that parses a Markdown formatted string into HTML output.

Also note the use of JavaScript's `atob()` method in the same line. The GitHub API returns file contents as Base64 encoded strings, which need to be decoded to be useful. Haxe has [its own implementation][9] of Base64 encoding and decoding in the `haxe.crypto` package, but it's intended for work with bytes. The aforementioned `atob()` method - [which decodes to a string][10] - is used because a completely cross-platform implementation isn't necessary for this application. After all, it is only targeting JavaScript.

```haxe
// gitblog/views/ArticleView.hx
package gitblog.views;

import framework.View;

import gitblog.models.ArticleModel;

class ArticleView extends View {
    public function new() {
        super('article', 'ArticleTemplate');
    }

    override public function update(article : ArticleModel) : Void {
        var date : String = article.timestamp.substr(0, 10);
        var time : String = article.timestamp.substr(11, 5).split('-').join(':');
        article.timestamp = date + ' @ ' + time;
        article.body = Markdown.markdownToHtml(js.Browser.window.atob(article.body));

        super.update({ article : article });
    }
}
```

## Controllers

The final and most important part of the blog are the _controllers_. Two controllers - `HomeController` and `ContentsController` - were defined by the routes set up in the application's main class. It is time to flesh them out!

The GitHub API URLs from the first article, which are used by the controllers, refer to my GitHub username. Change this to any other username you want to create the blog for. Of course, make sure that the appropriate repository and its contents exist as well.

### Home Controller

The home controller will display the user information and article list when the application script is loaded. Its `enter()` method, made mandatory by the `framework.Controller` interface, therefore isn't implemented - the necessary logic is called by the constructor.

The `gitblog.Connection` class is used to send a HTTP GET request to the GitHub API URLs mentioned in the first article of this series. Model creation and view updating is handled by a callback function triggered by a successful response. Callbacks for failed responses and HTTP status code changes are omitted for simplicity.

Note that the `gitblog.Responses` class wasn't covered by this series. It is merely a collection of type definitions describing the structure of a given API response. It is there to help the code completion engine do its job, and nothing more. You can create your own by looking at the API response and mimicking it in the form of the model parameter type definitions.

```haxe
// gitblog/controllers/HomeController.hx
package gitblog.controllers;

import framework.Controller;

import gitblog.Connection;
import gitblog.Responses;
import gitblog.models.ArticlesModel;
import gitblog.models.UserModel;
import gitblog.views.ArticlesView;
import gitblog.views.UserView;

class HomeController implements Controller {
    public function new() {
        var userApi = new Connection('https://api.github.com/users/dstrekelj');
        var userView = new UserView();

        userApi.onSuccess(function(Data : String) {
            var userData : Responses.UserResponse = haxe.Json.parse(Data);

            var userModel = new UserModel({
                avatar : userData.avatar_url,
                name : userData.name,
                email : userData.email,
                login : userData.login,
                location : userData.location,
                repos : userData.public_repos,
                url : userData.url
            });

            userView.update(userModel);
        }).get();

        var articlesApi = new Connection('https://api.github.com/repos/dstrekelj/dstrekelj.github.io/contents/content');
        var articlesView = new ArticlesView();

        articlesApi.onSuccess(function(Data : String) {
            var articlesData : Responses.ContentsResponse = haxe.Json.parse(Data);
            var articlesModels = new Array<ArticlesModel>();

            for (article in articlesData) {
                articlesModels.push(new ArticlesModel({
                    timestamp : article.name,
                    title : article.name,
                    path : article.path
                }));
            }

            articlesView.update(articlesModels);
        }).get();
    }

    public function enter(hash : String) : Void {}
}
```

### Contents (Articles) Controller

The controller handling a single article view is slightly simpler, but does the same thing. The constructor instantiates the view and HTTP connection objects, and the interface's `enter()` method describes the necessary logic.

```haxe
// gitblog/controllers/ContentsController.hx
package gitblog.controllers;

import framework.Controller;

import gitblog.Connection;
import gitblog.Responses;
import gitblog.models.ArticleModel;
import gitblog.views.ArticleView;

class ContentsController implements Controller {
    var content : Connection;
    var articleView : ArticleView;

    public function new() {
        content = new Connection('https://api.github.com/repos/dstrekelj/dstrekelj.github.io');
        articleView = new ArticleView();
    }

    public function enter(hash : String) : Void {
        content.parameters(hash).onSuccess(function(response : String) {
            var articleData : Responses.FileResponse = haxe.Json.parse(response);

            var articleModel = new ArticleModel({
                body : articleData.content,
                timestamp : articleData.name
            });

            articleView.update(articleModel);
        }).get();
    }
}
```

## Building the Project

With the controllers done, the GitHub powered blog should be complete as well. The build file is the only missing piece of the puzzle:

```hxml
# build.hxml

# Markdown haxelib for parsing markdown formatted articles
-lib markdown

# Templates are embedded as resources
-resource resources/article.mtt@ArticleTemplate
-resource resources/articles.mtt@ArticlesTemplate
-resource resources/user.mtt@UserTemplate

-cp gitblog
-main gitblog.GitBlog
-js bin/gitblog.js
```

The build file includes `markdown` dependency, and embeds the view templates into the output as resources.

Running `haxe build.hxml` from the project folder will result in the JavaScript output script.

To test the output, it's necessary to create an HTML index page to include the script in. This page should also have the expected parent elements for the views in place as well. For example:

```
<!--bin/index.html-->
<html>
    <head>
        <title>My GitHub Powered Blog!</title>
    </head>
    <body>
        <div id="user"></div>
        <div id="articles"></div>
        <div id="article"></div>
        <script src="gitblog.js"></script>
    </body>
</html>
```

If all went well, the page should not be empty. The GitHub powered blog is ready to go!

## Summary

Models are classes that store data to be displayed in views.

Templates place the model data in an HTML layout. Templates are embedded into compiler output as resources.

Views extend the `framework.View` class and format data before adding it to the template and updating their view container.

Controllers implement the `framework.Controller` interface in order for the application to call on them when a route is matched. Controllers request data from the API, create a model object based on the response, and hand the model over to the appropriate view for further processing.

## Conclusion

This project serves as an example of writing JavaScript with Haxe. While it may not go into detail when it should, I feel like the end result is worth any bumps and bruises along the way.

However, in my eagerness to demonstrate Haxe, I made a few mistakes. For example, using the cross-platform `haxe.Http` implementation of sending HTTP requests wasn't really necessary. The blog is intended to be compiled to a single platform - using native implementations instead of cross-platform ones would make more sense (and reduce lines of code in the compiler output). In other words, _the project lacks optimisation_. This is something I'll try and address in the future.

Another thing is, perhaps, the structure of this series of articles. You may have noticed that every article grows larger than the previous. This is, of course, unintended. It's a side effect of writing the series while still working on the project, and should not occur again.

I hope this project was as enjoyable for everyone else as it was for me. Make sure to check out the [project repository](https://github.com/dstrekelj/gitblog) if you haven't done so yet!

Until next time,

_Domagoj_

[1]: http://www.haxe.org/
[2]: https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller
[3]: http://haxe.org/manual/std-regex.html
[4]: https://developer.github.com/v3/repos/contents/#get-contents
[5]: http://api.haxe.org/haxe/Http.html
[6]: http://haxe.org/manual/std-template.html
[7]: http://haxe.org/manual/cr-resources.html
[8]: https://daringfireball.net/projects/markdown/
[9]: http://api.haxe.org/haxe/crypto/Base64.html
[10]: https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/atob