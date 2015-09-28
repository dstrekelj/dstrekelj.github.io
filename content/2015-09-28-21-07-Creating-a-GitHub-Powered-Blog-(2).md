# Creating a GitHub Powered Blog (2 / 3)

In this series of articles I'll explain how to create a GitHub-powered single-page blog such as this one - using [Haxe][1]!

This entry deals with creating a basic framework to handle routing of our single-page blog. Some terminology relates to the [Model-View-Controller pattern][2]. To those of you unfamiliar with MVC, I recommend reading up on it.

## Routing

Single-page web applications usally handle client-side routing by keeping track of the URL's fragment identifier (sometimes called a _hash link_).

### Fragment Identifier

A fragment identifier is a string starting with the hash sign ("#") which is appended to the URL of a website. Fragment identifiers are commonly used to create indexes, enabling the reader to navigate headings on a single page by clicking index links. For instance:

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

Handling routes is a fairly general task and as such can be handed off to a framework. For it to be possible, however, some requirements need to be met. The application must have a record of all known routes and controllers attached to those routes.

All routes will be stored in a map where routes are keys and controllers are values. To keep from reinventing the wheel, routes will be described with regular expressions. Controllers, on the other hand, will be described with their own type. More on that a bit later on.

A router function will be triggered when the hash changes. Its task will be to find a matching route for the current hash, and execute the controller attached to that route.

Considering the above, the main `App` class of the framework looks as follows:

```haxe
// framework/App.hx
package framework;

class App {
    // Maps routes to controllers
    var routes : Map<EReg, framework.Controller>;

    public function new() {
        routes = new Map<EReg, framework.Controller>();
        // Trigger router on hash change
        js.Browser.window.addEventListener('hashchange', router);
    }
    
    // Matches current hash to route and executes controller logic
    private function router(event : js.html.EventListener) : Void {
        // ...
    }
}
```

Before moving onto the router, it would make sense to enable setting new routes. This is a short addition to the `App` class:

```haxe
// Maps route to controller
public function route(route : EReg, controller : framework.Controller) : App {
    routes.set(route, controller);
    // Returning this to make chaining possible
    return this;
}
```

The router itself should take the current hash, find a matching route among mapped routes, and then call on the route's attached controller:

```haxe
private function router(event : js.html.EventListener) : Void {
    // Current hash, with the hash sign removed
    var hash : String = js.Browser.location.hash.substr(1);
    // Result of finding a matching route
    var route : EReg = findRoute(hash);

    if (route != null) {
        // Controller attached to route
        var controller : framework.Controller = routes.get(route);
        controller.onEnter(hash);
    } else {
        trace('ERROR: Unmatched route.');
    }
}

// Finds matching route for provided hash, returns null if no match
private function findRoute(hash : String) : EReg {
    for (route in routes.keys()) {
        if (route.match(hash)) {
            return route;
        }
    }
    return null;
}
```

Note that an error is traced in case there's no matching route.

This takes care of routing and route handling.

## Controllers

Controller logic differs from application to application. One thing controllers have in common is that they are called when their route is matched. The simplest way to ensure that is to describe the controller with an interface:

```haxe
// framework/Controller.hx
package framework;

interface Controller {
    /**
     * Called by `App` on hash change when visiting the attached route.
     * @param   hash    String, current hash matching the controlled route
     */
    public function onEnter(hash : String) : Void;
}
```

Every controller is thus required to have an `onEnter()` method. This method is called by the `App` class' router when a route is matched to the current hash. It's up to the developer to define how the application will behave when the controller is called upon.

## Views

Using Haxe's templating system can cause a lot of boilerplate code. Describing the view with its own class is a way of reducing that boilerplate.

In the context of this framework, a view consists of a template and a parent (DOM) element inside of which the view will be rendered. The view constructor therefore takes two parameters: the parent element ID, and the template name.

Executing the template is handled by an update method which takes view data as a parameter.

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

Developers retain the freedom to format view data before updating by overriding the `update()` method.

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