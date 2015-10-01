# Creating a GitHub Powered Blog (2 / 3)

_In this series of articles I'll explain how to create a GitHub-powered single-page blog such as this one - using [Haxe][1]! The repository is available [here](https://github.com/dstrekelj/gitblog)._

_This entry deals with creating a basic framework to handle routing of our single-page blog. Some terminology relates to the [Model-View-Controller pattern][2]. To those of you unfamiliar with MVC, I recommend reading up on it._

## Routing

Single-page web applications usally handle client-side routing by keeping track of the URL's fragment identifier (sometimes called a _hash link_).

### Fragment Identifier

A **fragment identifier** is a string starting with the hash sign ("#") which is appended to the URL of a website. Fragment identifiers are commonly used to create indexes, enabling the reader to navigate headings on a single page by clicking index links. For instance:

```html
<a href="#chapter1">Go to Chapter 1</a>
<a href="#chapter2">Go to Chapter 2</a>

<h1 id="chapter1">Chapter 1</h1>
<h1 id="chapter2">Chapter 2</h1>
```

Clicking on the "Go to Chapter 2" link would change the URL to `http://mysite.com/#chapter2`. Here, the fragment identifier is "#chapter2". Note that the identifier includes the hash character.

Changing the fragment identifier of a URL dispatches the [`onhashchange` event][3]. Listening for this change makes it possible for the application to "react" to the way a visitor navigates the webpage.

The hash change event is usually exploited to execute the logic behind a controller attached to the route represented by the fragment identifier. This principle is the foundation of client-side routing frameworks.

### Creating a Router

Routes are handled by a **router**. For a router to be able to its job the application must keep have a record of all known routes. **Routes** are, in the context of this project, defined as path-controller pairs.

Routes registered with the application will be stored in an array. This makes it possible to iterate through them in order of registration. Ordering routes from _exact_ to _inexact_ can be convenient. Registering an all-matching error-handling route last will, for instance, call on its controller when no other route is matched.

To keep from reinventing the wheel, route paths will be described with regular expressions since finding patterns is what they're intended for. Controllers, on the other hand, will be described with their own type. More on that later.

The router methodd will be triggered by a hash change event. It look for a matching route for the current hash, and execute the attached controller.

Considering the above, the main `App` class turns out follows:

```haxe
// framework/App.hx
package framework;

import framework.Controller;

private typedef Route = {
    var path : EReg;
    var controller : Controller;
}

class App {
    // Maps routes to controllers
    var routes : Array<Route>;

    public function new() {
        routes = new Array<Route>();
        // Trigger router on hash change
        js.Browser.window.addEventListener('hashchange', router);
    }
    
    // Matches current hash to route and executes controller logic
    private function router(event : js.html.EventListener) : Void {
        // TODO: fill this in.
    }
}
```

Before moving onto the router, it would make sense to enable setting registering new routes with the application. This is a short addition to the `App` class in the form of a `route()` method:

```haxe
// Maps route to controller
public function route(route : Route) : App {
    routes.push(route);
    // Returning this to make chaining possible
    return this;
}
```

The router itself should take the current hash and find a matching route among registered routes. When a matching route is found, its controller should be called. Otherwise, a simple error trace to the console should suffice:

```haxe
private function router(event : js.html.EventListener) : Void {
    // Current hash, with the hash sign removed
    var hash : String = js.Browser.location.hash.substr(1);
    // Result of finding a matching route
    var route : Route = findRoute(hash);

    if (route != null) {
        route.controller.onEnter(hash);
    } else {
        trace('ERROR: Unmatched route.');
    }
}

// Finds matching route for provided hash, returns null if no match
private function findRoute(hash : String) : Route {
    for (route in routes) {
        if (route.path.match(hash)) {
            return route;
        }
    }
    return null;
}
```

This takes care of routing. But, to make the framework usable, the controllers need to be described.

## Controllers

**Controllers**, in their simplest form, _control_ the actions that can occur when a page visitor navigates to the matching route path. In the context of this project the controller will be a _rule_, rather than an object. And rules are best enforced by interfaces:

```haxe
// framework/Controller.hx
package framework;

interface Controller {
    /**
     * Called by `App` on hash change when visiting the attached route.
     * @param   hash    String, current hash matching the controlled route
     */
    public function enter(hash : String) : Void;
}
```

The above interface requires every controller to have an `enter()` method. This method is called by the router when a route path is matched to the current hash. Controller logic, of course, depends on the use case - and is not the application's problem as long as the `enter()` method is present.

## Views

A **view** is a formatted display of certain (model) data. The formatting will be handled by [Haxe's templating system][4], which can unfortunately cause some boilerplate code. To reduce that bopilerplate, the view is described with its own class.

In the context of this framework, a view consists of a template and a parent DOM element. The view will be rendered inside the parent element by the `update()` method.

Note that the view template is loaded as a [resource][5], meaning that the class expects templates to be embedded as resources with unique identifiers.

```haxe
// framework/View.hx
package framework;

class View {
    // Parent DOM element
    var parentElement : js.html.Element;
    // View template
    var viewTemplate : haxe.Template;

    public function new(parentElementID : String, templateName : String) : Void {
        parentElement = js.Browser.document.getElementById(parentElementID);
        viewTemplate = new haxe.Template(haxe.Resource.getString(templateName));
    }

    // Executes the template with new data, updating the parent element
    public function update(viewData : Dynamic) : Void {
        parentElement.innerHTML = viewTemplate.execute(viewData);
    }
}
```

View data can easily be formatted before updating the view by overriding the `update()` method.

## Summary

The single-page application framework consists of two classes - `App` and `View` - and a `Controller` interface.

The `App` class keeps track of routes and handles route changes. This is achieved by use of fragment identifiers.

The `View` class handles the boilerplate created by using the Haxe templating system, as well as updating the view with new data.

The `Controller` interface describes the one method expected by the router. This method triggers controller logic when the attached route is matched.

In the next and final entry in this series, the GitHub-powered blog will finally take shape.

Until next time,

_Domagoj_

[1]: http://www.haxe.org/
[2]: https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller
[3]: https://developer.mozilla.org/en-US/docs/Web/API/HashChangeEvent
[4]: http://haxe.org/manual/std-template.html
[5]: http://haxe.org/manual/cr-resources.html