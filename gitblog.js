(function (console) { "use strict";
var $estr = function() { return js_Boot.__string_rec(this,''); };
function $extend(from, fields) {
	function Inherit() {} Inherit.prototype = from; var proto = new Inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var EReg = function(r,opt) {
	opt = opt.split("u").join("");
	this.r = new RegExp(r,opt);
};
EReg.__name__ = true;
EReg.prototype = {
	match: function(s) {
		if(this.r.global) this.r.lastIndex = 0;
		this.r.m = this.r.exec(s);
		this.r.s = s;
		return this.r.m != null;
	}
	,matched: function(n) {
		if(this.r.m != null && n >= 0 && n < this.r.m.length) return this.r.m[n]; else throw new js__$Boot_HaxeError("EReg::matched");
	}
	,matchedRight: function() {
		if(this.r.m == null) throw new js__$Boot_HaxeError("No string matched");
		var sz = this.r.m.index + this.r.m[0].length;
		return HxOverrides.substr(this.r.s,sz,this.r.s.length - sz);
	}
	,matchedPos: function() {
		if(this.r.m == null) throw new js__$Boot_HaxeError("No string matched");
		return { pos : this.r.m.index, len : this.r.m[0].length};
	}
	,matchSub: function(s,pos,len) {
		if(len == null) len = -1;
		if(this.r.global) {
			this.r.lastIndex = pos;
			this.r.m = this.r.exec(len < 0?s:HxOverrides.substr(s,0,pos + len));
			var b = this.r.m != null;
			if(b) this.r.s = s;
			return b;
		} else {
			var b1 = this.match(len < 0?HxOverrides.substr(s,pos,null):HxOverrides.substr(s,pos,len));
			if(b1) {
				this.r.s = s;
				this.r.m.index += pos;
			}
			return b1;
		}
	}
	,replace: function(s,by) {
		return s.replace(this.r,by);
	}
	,map: function(s,f) {
		var offset = 0;
		var buf = new StringBuf();
		do {
			if(offset >= s.length) break; else if(!this.matchSub(s,offset)) {
				buf.add(HxOverrides.substr(s,offset,null));
				break;
			}
			var p = this.matchedPos();
			buf.add(HxOverrides.substr(s,offset,p.pos - offset));
			buf.add(f(this));
			if(p.len == 0) {
				buf.add(HxOverrides.substr(s,p.pos,1));
				offset = p.pos + 1;
			} else offset = p.pos + p.len;
		} while(this.r.global);
		if(!this.r.global && offset > 0 && offset < s.length) buf.add(HxOverrides.substr(s,offset,null));
		return buf.b;
	}
	,__class__: EReg
};
var HxOverrides = function() { };
HxOverrides.__name__ = true;
HxOverrides.cca = function(s,index) {
	var x = s.charCodeAt(index);
	if(x != x) return undefined;
	return x;
};
HxOverrides.substr = function(s,pos,len) {
	if(pos != null && pos != 0 && len != null && len < 0) return "";
	if(len == null) len = s.length;
	if(pos < 0) {
		pos = s.length + pos;
		if(pos < 0) pos = 0;
	} else if(len < 0) len = s.length + len - pos;
	return s.substr(pos,len);
};
HxOverrides.indexOf = function(a,obj,i) {
	var len = a.length;
	if(i < 0) {
		i += len;
		if(i < 0) i = 0;
	}
	while(i < len) {
		if(a[i] === obj) return i;
		i++;
	}
	return -1;
};
HxOverrides.iter = function(a) {
	return { cur : 0, arr : a, hasNext : function() {
		return this.cur < this.arr.length;
	}, next : function() {
		return this.arr[this.cur++];
	}};
};
var Lambda = function() { };
Lambda.__name__ = true;
Lambda.exists = function(it,f) {
	var $it0 = $iterator(it)();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		if(f(x)) return true;
	}
	return false;
};
var List = function() {
	this.length = 0;
};
List.__name__ = true;
List.prototype = {
	add: function(item) {
		var x = [item];
		if(this.h == null) this.h = x; else this.q[1] = x;
		this.q = x;
		this.length++;
	}
	,push: function(item) {
		var x = [item,this.h];
		this.h = x;
		if(this.q == null) this.q = x;
		this.length++;
	}
	,first: function() {
		if(this.h == null) return null; else return this.h[0];
	}
	,pop: function() {
		if(this.h == null) return null;
		var x = this.h[0];
		this.h = this.h[1];
		if(this.h == null) this.q = null;
		this.length--;
		return x;
	}
	,isEmpty: function() {
		return this.h == null;
	}
	,iterator: function() {
		return new _$List_ListIterator(this.h);
	}
	,__class__: List
};
var _$List_ListIterator = function(head) {
	this.head = head;
	this.val = null;
};
_$List_ListIterator.__name__ = true;
_$List_ListIterator.prototype = {
	hasNext: function() {
		return this.head != null;
	}
	,next: function() {
		this.val = this.head[0];
		this.head = this.head[1];
		return this.val;
	}
	,__class__: _$List_ListIterator
};
var Markdown = function() { };
Markdown.__name__ = true;
Markdown.markdownToHtml = function(markdown) {
	var document = new Document();
	try {
		var lines = new EReg("(\r\n|\r)","g").replace(markdown,"\n").split("\n");
		document.parseRefLinks(lines);
		var blocks = document.parseLines(lines);
		return Markdown.renderHtml(blocks);
	} catch( e ) {
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		return "<pre>" + Std.string(e) + "</pre>";
	}
};
Markdown.renderHtml = function(blocks) {
	return new markdown_HtmlRenderer().render(blocks);
};
var Document = function() {
	this.refLinks = new haxe_ds_StringMap();
	this.inlineSyntaxes = [];
};
Document.__name__ = true;
Document.prototype = {
	parseRefLinks: function(lines) {
		var indent = "^[ ]{0,3}";
		var id = "\\[([^\\]]+)\\]";
		var quote = "\"[^\"]+\"";
		var apos = "'[^']+'";
		var paren = "\\([^)]+\\)";
		var titles = new EReg("(" + quote + "|" + apos + "|" + paren + ")","");
		var link = new EReg("" + indent + id + ":\\s+(\\S+)\\s*(" + quote + "|" + apos + "|" + paren + "|)\\s*$","");
		var _g1 = 0;
		var _g = lines.length;
		while(_g1 < _g) {
			var i = _g1++;
			if(!link.match(lines[i])) continue;
			var id1 = link.matched(1);
			var url = link.matched(2);
			var title = link.matched(3);
			if(StringTools.startsWith(url,"<") && StringTools.endsWith(url,">")) url = HxOverrides.substr(url,1,url.length - 2);
			if(title == "" && lines[i + 1] != null && titles.match(lines[i + 1])) {
				title = titles.matched(1);
				lines[i + 1] = "";
			}
			if(title == "") title = null; else title = title.substring(1,title.length - 1);
			id1 = id1.toLowerCase();
			var value = new Link(id1,url,title);
			this.refLinks.set(id1,value);
			lines[i] = "";
		}
	}
	,parseLines: function(lines) {
		var parser = new markdown_BlockParser(lines,this);
		var blocks = [];
		while(!(parser.pos >= parser.lines.length)) {
			var _g = 0;
			var _g1 = markdown_BlockSyntax.get_syntaxes();
			while(_g < _g1.length) {
				var syntax = _g1[_g];
				++_g;
				if(syntax.canParse(parser)) {
					var block = syntax.parse(parser);
					if(block != null) blocks.push(block);
					break;
				}
			}
		}
		return blocks;
	}
	,parseInline: function(text) {
		return new markdown_InlineParser(text,this).parse();
	}
	,__class__: Document
};
var Link = function(id,url,title) {
	this.id = id;
	this.url = url;
	this.title = title;
};
Link.__name__ = true;
Link.prototype = {
	__class__: Link
};
Math.__name__ = true;
var Reflect = function() { };
Reflect.__name__ = true;
Reflect.field = function(o,field) {
	try {
		return o[field];
	} catch( e ) {
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		return null;
	}
};
Reflect.callMethod = function(o,func,args) {
	return func.apply(o,args);
};
Reflect.compare = function(a,b) {
	if(a == b) return 0; else if(a > b) return 1; else return -1;
};
var Std = function() { };
Std.__name__ = true;
Std.string = function(s) {
	return js_Boot.__string_rec(s,"");
};
Std.parseInt = function(x) {
	var v = parseInt(x,10);
	if(v == 0 && (HxOverrides.cca(x,1) == 120 || HxOverrides.cca(x,1) == 88)) v = parseInt(x);
	if(isNaN(v)) return null;
	return v;
};
var StringBuf = function() {
	this.b = "";
};
StringBuf.__name__ = true;
StringBuf.prototype = {
	add: function(x) {
		this.b += Std.string(x);
	}
	,__class__: StringBuf
};
var StringTools = function() { };
StringTools.__name__ = true;
StringTools.htmlEscape = function(s,quotes) {
	s = s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
	if(quotes) return s.split("\"").join("&quot;").split("'").join("&#039;"); else return s;
};
StringTools.htmlUnescape = function(s) {
	return s.split("&gt;").join(">").split("&lt;").join("<").split("&quot;").join("\"").split("&#039;").join("'").split("&amp;").join("&");
};
StringTools.startsWith = function(s,start) {
	return s.length >= start.length && HxOverrides.substr(s,0,start.length) == start;
};
StringTools.endsWith = function(s,end) {
	var elen = end.length;
	var slen = s.length;
	return slen >= elen && HxOverrides.substr(s,slen - elen,elen) == end;
};
StringTools.isSpace = function(s,pos) {
	var c = HxOverrides.cca(s,pos);
	return c > 8 && c < 14 || c == 32;
};
StringTools.ltrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,r)) r++;
	if(r > 0) return HxOverrides.substr(s,r,l - r); else return s;
};
StringTools.rtrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,l - r - 1)) r++;
	if(r > 0) return HxOverrides.substr(s,0,l - r); else return s;
};
StringTools.trim = function(s) {
	return StringTools.ltrim(StringTools.rtrim(s));
};
StringTools.replace = function(s,sub,by) {
	return s.split(sub).join(by);
};
StringTools.fastCodeAt = function(s,index) {
	return s.charCodeAt(index);
};
var frank_App = function() {
	this.routes = [];
	window.addEventListener("hashchange",$bind(this,this.router));
};
frank_App.__name__ = true;
frank_App.prototype = {
	route: function(route) {
		this.routes.push(route);
		return this;
	}
	,run: function() {
		this.router();
	}
	,router: function(event) {
		var hash;
		var _this = window.location.hash;
		hash = HxOverrides.substr(_this,1,null);
		var route = this.findRoute(hash);
		if(route != null) route.controller.enter(hash); else console.log("ERROR: Unmatched route.");
	}
	,findRoute: function(hash) {
		var _g = 0;
		var _g1 = this.routes;
		while(_g < _g1.length) {
			var route = _g1[_g];
			++_g;
			if(route.path.match(hash)) return route;
		}
		return null;
	}
	,__class__: frank_App
};
var frank_Controller = function() { };
frank_Controller.__name__ = true;
frank_Controller.prototype = {
	__class__: frank_Controller
};
var frank_View = function(parentElementID,templateName) {
	this.parentElement = window.document.getElementById(parentElementID);
	this.viewTemplate = new haxe_Template(haxe_Resource.getString(templateName));
};
frank_View.__name__ = true;
frank_View.prototype = {
	update: function(viewData) {
		this.parentElement.innerHTML = this.viewTemplate.execute(viewData);
	}
	,__class__: frank_View
};
var haxe_Http = function(url) {
	this.url = url;
	this.headers = new List();
	this.params = new List();
	this.async = true;
};
haxe_Http.__name__ = true;
haxe_Http.prototype = {
	request: function(post) {
		var me = this;
		me.responseData = null;
		var r = this.req = js_Browser.createXMLHttpRequest();
		var onreadystatechange = function(_) {
			if(r.readyState != 4) return;
			var s;
			try {
				s = r.status;
			} catch( e ) {
				if (e instanceof js__$Boot_HaxeError) e = e.val;
				s = null;
			}
			if(s != null) {
				var protocol = window.location.protocol.toLowerCase();
				var rlocalProtocol = new EReg("^(?:about|app|app-storage|.+-extension|file|res|widget):$","");
				var isLocal = rlocalProtocol.match(protocol);
				if(isLocal) if(r.responseText != null) s = 200; else s = 404;
			}
			if(s == undefined) s = null;
			if(s != null) me.onStatus(s);
			if(s != null && s >= 200 && s < 400) {
				me.req = null;
				me.onData(me.responseData = r.responseText);
			} else if(s == null) {
				me.req = null;
				me.onError("Failed to connect or resolve host");
			} else switch(s) {
			case 12029:
				me.req = null;
				me.onError("Failed to connect to host");
				break;
			case 12007:
				me.req = null;
				me.onError("Unknown host");
				break;
			default:
				me.req = null;
				me.responseData = r.responseText;
				me.onError("Http Error #" + r.status);
			}
		};
		if(this.async) r.onreadystatechange = onreadystatechange;
		var uri = this.postData;
		if(uri != null) post = true; else {
			var _g_head = this.params.h;
			var _g_val = null;
			while(_g_head != null) {
				var p;
				p = (function($this) {
					var $r;
					_g_val = _g_head[0];
					_g_head = _g_head[1];
					$r = _g_val;
					return $r;
				}(this));
				if(uri == null) uri = ""; else uri += "&";
				uri += encodeURIComponent(p.param) + "=" + encodeURIComponent(p.value);
			}
		}
		try {
			if(post) r.open("POST",this.url,this.async); else if(uri != null) {
				var question = this.url.split("?").length <= 1;
				r.open("GET",this.url + (question?"?":"&") + uri,this.async);
				uri = null;
			} else r.open("GET",this.url,this.async);
		} catch( e1 ) {
			if (e1 instanceof js__$Boot_HaxeError) e1 = e1.val;
			me.req = null;
			this.onError(e1.toString());
			return;
		}
		if(!Lambda.exists(this.headers,function(h) {
			return h.header == "Content-Type";
		}) && post && this.postData == null) r.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
		var _g_head1 = this.headers.h;
		var _g_val1 = null;
		while(_g_head1 != null) {
			var h1;
			h1 = (function($this) {
				var $r;
				_g_val1 = _g_head1[0];
				_g_head1 = _g_head1[1];
				$r = _g_val1;
				return $r;
			}(this));
			r.setRequestHeader(h1.header,h1.value);
		}
		r.send(uri);
		if(!this.async) onreadystatechange(null);
	}
	,onData: function(data) {
	}
	,onError: function(msg) {
	}
	,onStatus: function(status) {
	}
	,__class__: haxe_Http
};
var gitblog_Connection = function(baseURL) {
	this.baseURL = baseURL;
	haxe_Http.call(this,this.baseURL);
};
gitblog_Connection.__name__ = true;
gitblog_Connection.__super__ = haxe_Http;
gitblog_Connection.prototype = $extend(haxe_Http.prototype,{
	get: function() {
		haxe_Http.prototype.request.call(this,false);
		return this;
	}
	,onChange: function(callback) {
		this.onStatus = callback;
		return this;
	}
	,onFailure: function(callback) {
		this.onError = callback;
		return this;
	}
	,onSuccess: function(callback) {
		this.onData = callback;
		return this;
	}
	,parameters: function(params) {
		this.url = this.baseURL + params;
		return this;
	}
	,post: function() {
		haxe_Http.prototype.request.call(this,true);
		return this;
	}
	,__class__: gitblog_Connection
});
var gitblog_GitBlog = function() {
	new frank_App().route({ path : new EReg("^/$",""), controller : new gitblog_controllers_HomeController()}).route({ path : new EReg("^/contents/(.*)$",""), controller : new gitblog_controllers_ContentsController()}).run();
};
gitblog_GitBlog.__name__ = true;
gitblog_GitBlog.main = function() {
	new gitblog_GitBlog();
};
gitblog_GitBlog.prototype = {
	__class__: gitblog_GitBlog
};
var gitblog_controllers_ContentsController = function() {
	this.content = new gitblog_Connection("https://api.github.com/repos/dstrekelj/dstrekelj.github.io");
	this.articleView = new gitblog_views_ArticleView();
};
gitblog_controllers_ContentsController.__name__ = true;
gitblog_controllers_ContentsController.__interfaces__ = [frank_Controller];
gitblog_controllers_ContentsController.prototype = {
	enter: function(hash) {
		var _g = this;
		this.content.parameters(hash).onSuccess(function(response) {
			var articleData = JSON.parse(response);
			var articleModel = new gitblog_models_ArticleModel({ body : articleData.content, timestamp : articleData.name});
			_g.articleView.update(articleModel);
		}).get();
	}
	,__class__: gitblog_controllers_ContentsController
};
var gitblog_controllers_HomeController = function() {
	var userApi = new gitblog_Connection("https://api.github.com/users/dstrekelj");
	var userView = new gitblog_views_UserView();
	userApi.onSuccess(function(Data) {
		var userData = JSON.parse(Data);
		var userModel = new gitblog_models_UserModel({ avatar : userData.avatar_url, name : userData.name, email : userData.email, login : userData.login, location : userData.location, repos : userData.public_repos, url : userData.url});
		userView.update(userModel);
	}).get();
	var articlesApi = new gitblog_Connection("https://api.github.com/repos/dstrekelj/dstrekelj.github.io/contents/content");
	var articlesView = new gitblog_views_ArticlesView();
	articlesApi.onSuccess(function(Data1) {
		var articlesData = JSON.parse(Data1);
		var articlesModels = [];
		var _g = 0;
		while(_g < articlesData.length) {
			var article = articlesData[_g];
			++_g;
			articlesModels.push(new gitblog_models_ArticlesModel({ timestamp : article.name, title : article.name, path : article.path}));
		}
		articlesView.update(articlesModels);
	}).get();
};
gitblog_controllers_HomeController.__name__ = true;
gitblog_controllers_HomeController.__interfaces__ = [frank_Controller];
gitblog_controllers_HomeController.prototype = {
	enter: function(hash) {
	}
	,__class__: gitblog_controllers_HomeController
};
var gitblog_models_ArticleModel = function(params) {
	this.body = params.body;
	this.timestamp = params.timestamp;
};
gitblog_models_ArticleModel.__name__ = true;
gitblog_models_ArticleModel.prototype = {
	__class__: gitblog_models_ArticleModel
};
var gitblog_models_ArticlesModel = function(params) {
	this.timestamp = params.timestamp;
	this.title = params.title;
	this.path = params.path;
};
gitblog_models_ArticlesModel.__name__ = true;
gitblog_models_ArticlesModel.prototype = {
	__class__: gitblog_models_ArticlesModel
};
var gitblog_models_UserModel = function(params) {
	this.avatar = params.avatar;
	this.email = params.email;
	this.location = params.location;
	this.login = params.login;
	this.name = params.name;
	this.repos = params.repos;
	this.url = params.url;
};
gitblog_models_UserModel.__name__ = true;
gitblog_models_UserModel.prototype = {
	__class__: gitblog_models_UserModel
};
var gitblog_views_ArticleView = function() {
	frank_View.call(this,"article","ArticleTemplate");
};
gitblog_views_ArticleView.__name__ = true;
gitblog_views_ArticleView.__super__ = frank_View;
gitblog_views_ArticleView.prototype = $extend(frank_View.prototype,{
	update: function(article) {
		var date = HxOverrides.substr(article.timestamp,0,10);
		var time = HxOverrides.substr(article.timestamp,11,5).split("-").join(":");
		article.timestamp = date + " @ " + time;
		article.body = Markdown.markdownToHtml(window.atob(article.body));
		frank_View.prototype.update.call(this,{ article : article});
		highlightly_Highlightly.highlight();
	}
	,__class__: gitblog_views_ArticleView
});
var gitblog_views_ArticlesView = function() {
	frank_View.call(this,"articles","ArticlesTemplate");
};
gitblog_views_ArticlesView.__name__ = true;
gitblog_views_ArticlesView.__super__ = frank_View;
gitblog_views_ArticlesView.prototype = $extend(frank_View.prototype,{
	update: function(articles) {
		var _g = 0;
		while(_g < articles.length) {
			var article = articles[_g];
			++_g;
			var date = HxOverrides.substr(article.timestamp,0,10);
			var time = HxOverrides.substr(article.timestamp,11,5).split("-").join(":");
			article.timestamp = date + " @ " + time;
			article.title = article.title.substring(17,article.title.length - 3).split("-").join(" ");
		}
		frank_View.prototype.update.call(this,{ articles : articles});
	}
	,__class__: gitblog_views_ArticlesView
});
var gitblog_views_UserView = function() {
	frank_View.call(this,"user","UserTemplate");
};
gitblog_views_UserView.__name__ = true;
gitblog_views_UserView.__super__ = frank_View;
gitblog_views_UserView.prototype = $extend(frank_View.prototype,{
	update: function(user) {
		frank_View.prototype.update.call(this,{ user : user});
	}
	,__class__: gitblog_views_UserView
});
var haxe_IMap = function() { };
haxe_IMap.__name__ = true;
var haxe__$Int64__$_$_$Int64 = function(high,low) {
	this.high = high;
	this.low = low;
};
haxe__$Int64__$_$_$Int64.__name__ = true;
haxe__$Int64__$_$_$Int64.prototype = {
	__class__: haxe__$Int64__$_$_$Int64
};
var haxe_Resource = function() { };
haxe_Resource.__name__ = true;
haxe_Resource.getString = function(name) {
	var _g = 0;
	var _g1 = haxe_Resource.content;
	while(_g < _g1.length) {
		var x = _g1[_g];
		++_g;
		if(x.name == name) {
			if(x.str != null) return x.str;
			var b = haxe_crypto_Base64.decode(x.data);
			return b.toString();
		}
	}
	return null;
};
var haxe__$Template_TemplateExpr = { __ename__ : true, __constructs__ : ["OpVar","OpExpr","OpIf","OpStr","OpBlock","OpForeach","OpMacro"] };
haxe__$Template_TemplateExpr.OpVar = function(v) { var $x = ["OpVar",0,v]; $x.__enum__ = haxe__$Template_TemplateExpr; $x.toString = $estr; return $x; };
haxe__$Template_TemplateExpr.OpExpr = function(expr) { var $x = ["OpExpr",1,expr]; $x.__enum__ = haxe__$Template_TemplateExpr; $x.toString = $estr; return $x; };
haxe__$Template_TemplateExpr.OpIf = function(expr,eif,eelse) { var $x = ["OpIf",2,expr,eif,eelse]; $x.__enum__ = haxe__$Template_TemplateExpr; $x.toString = $estr; return $x; };
haxe__$Template_TemplateExpr.OpStr = function(str) { var $x = ["OpStr",3,str]; $x.__enum__ = haxe__$Template_TemplateExpr; $x.toString = $estr; return $x; };
haxe__$Template_TemplateExpr.OpBlock = function(l) { var $x = ["OpBlock",4,l]; $x.__enum__ = haxe__$Template_TemplateExpr; $x.toString = $estr; return $x; };
haxe__$Template_TemplateExpr.OpForeach = function(expr,loop) { var $x = ["OpForeach",5,expr,loop]; $x.__enum__ = haxe__$Template_TemplateExpr; $x.toString = $estr; return $x; };
haxe__$Template_TemplateExpr.OpMacro = function(name,params) { var $x = ["OpMacro",6,name,params]; $x.__enum__ = haxe__$Template_TemplateExpr; $x.toString = $estr; return $x; };
var haxe_Template = function(str) {
	var tokens = this.parseTokens(str);
	this.expr = this.parseBlock(tokens);
	if(!tokens.isEmpty()) throw new js__$Boot_HaxeError("Unexpected '" + Std.string(tokens.first().s) + "'");
};
haxe_Template.__name__ = true;
haxe_Template.prototype = {
	execute: function(context,macros) {
		if(macros == null) this.macros = { }; else this.macros = macros;
		this.context = context;
		this.stack = new List();
		this.buf = new StringBuf();
		this.run(this.expr);
		return this.buf.b;
	}
	,resolve: function(v) {
		if(Object.prototype.hasOwnProperty.call(this.context,v)) return Reflect.field(this.context,v);
		var _g_head = this.stack.h;
		var _g_val = null;
		while(_g_head != null) {
			var ctx;
			_g_val = _g_head[0];
			_g_head = _g_head[1];
			ctx = _g_val;
			if(Object.prototype.hasOwnProperty.call(ctx,v)) return Reflect.field(ctx,v);
		}
		if(v == "__current__") return this.context;
		return Reflect.field(haxe_Template.globals,v);
	}
	,parseTokens: function(data) {
		var tokens = new List();
		while(haxe_Template.splitter.match(data)) {
			var p = haxe_Template.splitter.matchedPos();
			if(p.pos > 0) tokens.add({ p : HxOverrides.substr(data,0,p.pos), s : true, l : null});
			if(HxOverrides.cca(data,p.pos) == 58) {
				tokens.add({ p : HxOverrides.substr(data,p.pos + 2,p.len - 4), s : false, l : null});
				data = haxe_Template.splitter.matchedRight();
				continue;
			}
			var parp = p.pos + p.len;
			var npar = 1;
			var params = [];
			var part = "";
			while(true) {
				var c = HxOverrides.cca(data,parp);
				parp++;
				if(c == 40) npar++; else if(c == 41) {
					npar--;
					if(npar <= 0) break;
				} else if(c == null) throw new js__$Boot_HaxeError("Unclosed macro parenthesis");
				if(c == 44 && npar == 1) {
					params.push(part);
					part = "";
				} else part += String.fromCharCode(c);
			}
			params.push(part);
			tokens.add({ p : haxe_Template.splitter.matched(2), s : false, l : params});
			data = HxOverrides.substr(data,parp,data.length - parp);
		}
		if(data.length > 0) tokens.add({ p : data, s : true, l : null});
		return tokens;
	}
	,parseBlock: function(tokens) {
		var l = new List();
		while(true) {
			var t = tokens.first();
			if(t == null) break;
			if(!t.s && (t.p == "end" || t.p == "else" || HxOverrides.substr(t.p,0,7) == "elseif ")) break;
			l.add(this.parse(tokens));
		}
		if(l.length == 1) return l.first();
		return haxe__$Template_TemplateExpr.OpBlock(l);
	}
	,parse: function(tokens) {
		var t = tokens.pop();
		var p = t.p;
		if(t.s) return haxe__$Template_TemplateExpr.OpStr(p);
		if(t.l != null) {
			var pe = new List();
			var _g = 0;
			var _g1 = t.l;
			while(_g < _g1.length) {
				var p1 = _g1[_g];
				++_g;
				pe.add(this.parseBlock(this.parseTokens(p1)));
			}
			return haxe__$Template_TemplateExpr.OpMacro(p,pe);
		}
		if(HxOverrides.substr(p,0,3) == "if ") {
			p = HxOverrides.substr(p,3,p.length - 3);
			var e = this.parseExpr(p);
			var eif = this.parseBlock(tokens);
			var t1 = tokens.first();
			var eelse;
			if(t1 == null) throw new js__$Boot_HaxeError("Unclosed 'if'");
			if(t1.p == "end") {
				tokens.pop();
				eelse = null;
			} else if(t1.p == "else") {
				tokens.pop();
				eelse = this.parseBlock(tokens);
				t1 = tokens.pop();
				if(t1 == null || t1.p != "end") throw new js__$Boot_HaxeError("Unclosed 'else'");
			} else {
				t1.p = HxOverrides.substr(t1.p,4,t1.p.length - 4);
				eelse = this.parse(tokens);
			}
			return haxe__$Template_TemplateExpr.OpIf(e,eif,eelse);
		}
		if(HxOverrides.substr(p,0,8) == "foreach ") {
			p = HxOverrides.substr(p,8,p.length - 8);
			var e1 = this.parseExpr(p);
			var efor = this.parseBlock(tokens);
			var t2 = tokens.pop();
			if(t2 == null || t2.p != "end") throw new js__$Boot_HaxeError("Unclosed 'foreach'");
			return haxe__$Template_TemplateExpr.OpForeach(e1,efor);
		}
		if(haxe_Template.expr_splitter.match(p)) return haxe__$Template_TemplateExpr.OpExpr(this.parseExpr(p));
		return haxe__$Template_TemplateExpr.OpVar(p);
	}
	,parseExpr: function(data) {
		var l = new List();
		var expr = data;
		while(haxe_Template.expr_splitter.match(data)) {
			var p = haxe_Template.expr_splitter.matchedPos();
			var k = p.pos + p.len;
			if(p.pos != 0) l.add({ p : HxOverrides.substr(data,0,p.pos), s : true});
			var p1 = haxe_Template.expr_splitter.matched(0);
			l.add({ p : p1, s : p1.indexOf("\"") >= 0});
			data = haxe_Template.expr_splitter.matchedRight();
		}
		if(data.length != 0) l.add({ p : data, s : true});
		var e;
		try {
			e = this.makeExpr(l);
			if(!l.isEmpty()) throw new js__$Boot_HaxeError(l.first().p);
		} catch( s ) {
			if (s instanceof js__$Boot_HaxeError) s = s.val;
			if( js_Boot.__instanceof(s,String) ) {
				throw new js__$Boot_HaxeError("Unexpected '" + s + "' in " + expr);
			} else throw(s);
		}
		return function() {
			try {
				return e();
			} catch( exc ) {
				if (exc instanceof js__$Boot_HaxeError) exc = exc.val;
				throw new js__$Boot_HaxeError("Error : " + Std.string(exc) + " in " + expr);
			}
		};
	}
	,makeConst: function(v) {
		haxe_Template.expr_trim.match(v);
		v = haxe_Template.expr_trim.matched(1);
		if(HxOverrides.cca(v,0) == 34) {
			var str = HxOverrides.substr(v,1,v.length - 2);
			return function() {
				return str;
			};
		}
		if(haxe_Template.expr_int.match(v)) {
			var i = Std.parseInt(v);
			return function() {
				return i;
			};
		}
		if(haxe_Template.expr_float.match(v)) {
			var f = parseFloat(v);
			return function() {
				return f;
			};
		}
		var me = this;
		return function() {
			return me.resolve(v);
		};
	}
	,makePath: function(e,l) {
		var p = l.first();
		if(p == null || p.p != ".") return e;
		l.pop();
		var field = l.pop();
		if(field == null || !field.s) throw new js__$Boot_HaxeError(field.p);
		var f = field.p;
		haxe_Template.expr_trim.match(f);
		f = haxe_Template.expr_trim.matched(1);
		return this.makePath(function() {
			return Reflect.field(e(),f);
		},l);
	}
	,makeExpr: function(l) {
		return this.makePath(this.makeExpr2(l),l);
	}
	,makeExpr2: function(l) {
		var p = l.pop();
		if(p == null) throw new js__$Boot_HaxeError("<eof>");
		if(p.s) return this.makeConst(p.p);
		var _g = p.p;
		switch(_g) {
		case "(":
			var e1 = this.makeExpr(l);
			var p1 = l.pop();
			if(p1 == null || p1.s) throw new js__$Boot_HaxeError(p1.p);
			if(p1.p == ")") return e1;
			var e2 = this.makeExpr(l);
			var p2 = l.pop();
			if(p2 == null || p2.p != ")") throw new js__$Boot_HaxeError(p2.p);
			var _g1 = p1.p;
			switch(_g1) {
			case "+":
				return function() {
					return e1() + e2();
				};
			case "-":
				return function() {
					return e1() - e2();
				};
			case "*":
				return function() {
					return e1() * e2();
				};
			case "/":
				return function() {
					return e1() / e2();
				};
			case ">":
				return function() {
					return e1() > e2();
				};
			case "<":
				return function() {
					return e1() < e2();
				};
			case ">=":
				return function() {
					return e1() >= e2();
				};
			case "<=":
				return function() {
					return e1() <= e2();
				};
			case "==":
				return function() {
					return e1() == e2();
				};
			case "!=":
				return function() {
					return e1() != e2();
				};
			case "&&":
				return function() {
					return e1() && e2();
				};
			case "||":
				return function() {
					return e1() || e2();
				};
			default:
				throw new js__$Boot_HaxeError("Unknown operation " + p1.p);
			}
			break;
		case "!":
			var e = this.makeExpr(l);
			return function() {
				var v = e();
				return v == null || v == false;
			};
		case "-":
			var e3 = this.makeExpr(l);
			return function() {
				return -e3();
			};
		}
		throw new js__$Boot_HaxeError(p.p);
	}
	,run: function(e) {
		switch(e[1]) {
		case 0:
			var v = e[2];
			this.buf.add(Std.string(this.resolve(v)));
			break;
		case 1:
			var e1 = e[2];
			this.buf.add(Std.string(e1()));
			break;
		case 2:
			var eelse = e[4];
			var eif = e[3];
			var e2 = e[2];
			var v1 = e2();
			if(v1 == null || v1 == false) {
				if(eelse != null) this.run(eelse);
			} else this.run(eif);
			break;
		case 3:
			var str = e[2];
			if(str == null) this.buf.b += "null"; else this.buf.b += "" + str;
			break;
		case 4:
			var l = e[2];
			var _g_head = l.h;
			var _g_val = null;
			while(_g_head != null) {
				var e3;
				e3 = (function($this) {
					var $r;
					_g_val = _g_head[0];
					_g_head = _g_head[1];
					$r = _g_val;
					return $r;
				}(this));
				this.run(e3);
			}
			break;
		case 5:
			var loop = e[3];
			var e4 = e[2];
			var v2 = e4();
			try {
				var x = $iterator(v2)();
				if(x.hasNext == null) throw new js__$Boot_HaxeError(null);
				v2 = x;
			} catch( e5 ) {
				if (e5 instanceof js__$Boot_HaxeError) e5 = e5.val;
				try {
					if(v2.hasNext == null) throw new js__$Boot_HaxeError(null);
				} catch( e6 ) {
					if (e6 instanceof js__$Boot_HaxeError) e6 = e6.val;
					throw new js__$Boot_HaxeError("Cannot iter on " + Std.string(v2));
				}
			}
			this.stack.push(this.context);
			var v3 = v2;
			while( v3.hasNext() ) {
				var ctx = v3.next();
				this.context = ctx;
				this.run(loop);
			}
			this.context = this.stack.pop();
			break;
		case 6:
			var params = e[3];
			var m = e[2];
			var v4 = Reflect.field(this.macros,m);
			var pl = [];
			var old = this.buf;
			pl.push($bind(this,this.resolve));
			var _g_head1 = params.h;
			var _g_val1 = null;
			while(_g_head1 != null) {
				var p;
				p = (function($this) {
					var $r;
					_g_val1 = _g_head1[0];
					_g_head1 = _g_head1[1];
					$r = _g_val1;
					return $r;
				}(this));
				switch(p[1]) {
				case 0:
					var v5 = p[2];
					pl.push(this.resolve(v5));
					break;
				default:
					this.buf = new StringBuf();
					this.run(p);
					pl.push(this.buf.b);
				}
			}
			this.buf = old;
			try {
				this.buf.add(Std.string(Reflect.callMethod(this.macros,v4,pl)));
			} catch( e7 ) {
				if (e7 instanceof js__$Boot_HaxeError) e7 = e7.val;
				var plstr;
				try {
					plstr = pl.join(",");
				} catch( e8 ) {
					if (e8 instanceof js__$Boot_HaxeError) e8 = e8.val;
					plstr = "???";
				}
				var msg = "Macro call " + m + "(" + plstr + ") failed (" + Std.string(e7) + ")";
				throw new js__$Boot_HaxeError(msg);
			}
			break;
		}
	}
	,__class__: haxe_Template
};
var haxe_io_Bytes = function(data) {
	this.length = data.byteLength;
	this.b = new Uint8Array(data);
	this.b.bufferValue = data;
	data.hxBytes = this;
	data.bytes = this.b;
};
haxe_io_Bytes.__name__ = true;
haxe_io_Bytes.alloc = function(length) {
	return new haxe_io_Bytes(new ArrayBuffer(length));
};
haxe_io_Bytes.ofString = function(s) {
	var a = [];
	var i = 0;
	while(i < s.length) {
		var c = StringTools.fastCodeAt(s,i++);
		if(55296 <= c && c <= 56319) c = c - 55232 << 10 | StringTools.fastCodeAt(s,i++) & 1023;
		if(c <= 127) a.push(c); else if(c <= 2047) {
			a.push(192 | c >> 6);
			a.push(128 | c & 63);
		} else if(c <= 65535) {
			a.push(224 | c >> 12);
			a.push(128 | c >> 6 & 63);
			a.push(128 | c & 63);
		} else {
			a.push(240 | c >> 18);
			a.push(128 | c >> 12 & 63);
			a.push(128 | c >> 6 & 63);
			a.push(128 | c & 63);
		}
	}
	return new haxe_io_Bytes(new Uint8Array(a).buffer);
};
haxe_io_Bytes.prototype = {
	get: function(pos) {
		return this.b[pos];
	}
	,set: function(pos,v) {
		this.b[pos] = v & 255;
	}
	,getString: function(pos,len) {
		if(pos < 0 || len < 0 || pos + len > this.length) throw new js__$Boot_HaxeError(haxe_io_Error.OutsideBounds);
		var s = "";
		var b = this.b;
		var fcc = String.fromCharCode;
		var i = pos;
		var max = pos + len;
		while(i < max) {
			var c = b[i++];
			if(c < 128) {
				if(c == 0) break;
				s += fcc(c);
			} else if(c < 224) s += fcc((c & 63) << 6 | b[i++] & 127); else if(c < 240) {
				var c2 = b[i++];
				s += fcc((c & 31) << 12 | (c2 & 127) << 6 | b[i++] & 127);
			} else {
				var c21 = b[i++];
				var c3 = b[i++];
				var u = (c & 15) << 18 | (c21 & 127) << 12 | (c3 & 127) << 6 | b[i++] & 127;
				s += fcc((u >> 10) + 55232);
				s += fcc(u & 1023 | 56320);
			}
		}
		return s;
	}
	,toString: function() {
		return this.getString(0,this.length);
	}
	,__class__: haxe_io_Bytes
};
var haxe_crypto_Base64 = function() { };
haxe_crypto_Base64.__name__ = true;
haxe_crypto_Base64.decode = function(str,complement) {
	if(complement == null) complement = true;
	if(complement) while(HxOverrides.cca(str,str.length - 1) == 61) str = HxOverrides.substr(str,0,-1);
	return new haxe_crypto_BaseCode(haxe_crypto_Base64.BYTES).decodeBytes(haxe_io_Bytes.ofString(str));
};
var haxe_crypto_BaseCode = function(base) {
	var len = base.length;
	var nbits = 1;
	while(len > 1 << nbits) nbits++;
	if(nbits > 8 || len != 1 << nbits) throw new js__$Boot_HaxeError("BaseCode : base length must be a power of two.");
	this.base = base;
	this.nbits = nbits;
};
haxe_crypto_BaseCode.__name__ = true;
haxe_crypto_BaseCode.prototype = {
	initTable: function() {
		var tbl = [];
		var _g = 0;
		while(_g < 256) {
			var i = _g++;
			tbl[i] = -1;
		}
		var _g1 = 0;
		var _g2 = this.base.length;
		while(_g1 < _g2) {
			var i1 = _g1++;
			tbl[this.base.b[i1]] = i1;
		}
		this.tbl = tbl;
	}
	,decodeBytes: function(b) {
		var nbits = this.nbits;
		var base = this.base;
		if(this.tbl == null) this.initTable();
		var tbl = this.tbl;
		var size = b.length * nbits >> 3;
		var out = haxe_io_Bytes.alloc(size);
		var buf = 0;
		var curbits = 0;
		var pin = 0;
		var pout = 0;
		while(pout < size) {
			while(curbits < 8) {
				curbits += nbits;
				buf <<= nbits;
				var i = tbl[b.get(pin++)];
				if(i == -1) throw new js__$Boot_HaxeError("BaseCode : invalid encoded char");
				buf |= i;
			}
			curbits -= 8;
			out.set(pout++,buf >> curbits & 255);
		}
		return out;
	}
	,__class__: haxe_crypto_BaseCode
};
var haxe_ds_StringMap = function() {
	this.h = { };
};
haxe_ds_StringMap.__name__ = true;
haxe_ds_StringMap.__interfaces__ = [haxe_IMap];
haxe_ds_StringMap.prototype = {
	set: function(key,value) {
		if(__map_reserved[key] != null) this.setReserved(key,value); else this.h[key] = value;
	}
	,get: function(key) {
		if(__map_reserved[key] != null) return this.getReserved(key);
		return this.h[key];
	}
	,setReserved: function(key,value) {
		if(this.rh == null) this.rh = { };
		this.rh["$" + key] = value;
	}
	,getReserved: function(key) {
		if(this.rh == null) return null; else return this.rh["$" + key];
	}
	,keys: function() {
		var _this = this.arrayKeys();
		return HxOverrides.iter(_this);
	}
	,arrayKeys: function() {
		var out = [];
		for( var key in this.h ) {
		if(this.h.hasOwnProperty(key)) out.push(key);
		}
		if(this.rh != null) {
			for( var key in this.rh ) {
			if(key.charCodeAt(0) == 36) out.push(key.substr(1));
			}
		}
		return out;
	}
	,__class__: haxe_ds_StringMap
};
var haxe_io_Error = { __ename__ : true, __constructs__ : ["Blocked","Overflow","OutsideBounds","Custom"] };
haxe_io_Error.Blocked = ["Blocked",0];
haxe_io_Error.Blocked.toString = $estr;
haxe_io_Error.Blocked.__enum__ = haxe_io_Error;
haxe_io_Error.Overflow = ["Overflow",1];
haxe_io_Error.Overflow.toString = $estr;
haxe_io_Error.Overflow.__enum__ = haxe_io_Error;
haxe_io_Error.OutsideBounds = ["OutsideBounds",2];
haxe_io_Error.OutsideBounds.toString = $estr;
haxe_io_Error.OutsideBounds.__enum__ = haxe_io_Error;
haxe_io_Error.Custom = function(e) { var $x = ["Custom",3,e]; $x.__enum__ = haxe_io_Error; $x.toString = $estr; return $x; };
var haxe_io_FPHelper = function() { };
haxe_io_FPHelper.__name__ = true;
haxe_io_FPHelper.i32ToFloat = function(i) {
	var sign = 1 - (i >>> 31 << 1);
	var exp = i >>> 23 & 255;
	var sig = i & 8388607;
	if(sig == 0 && exp == 0) return 0.0;
	return sign * (1 + Math.pow(2,-23) * sig) * Math.pow(2,exp - 127);
};
haxe_io_FPHelper.floatToI32 = function(f) {
	if(f == 0) return 0;
	var af;
	if(f < 0) af = -f; else af = f;
	var exp = Math.floor(Math.log(af) / 0.6931471805599453);
	if(exp < -127) exp = -127; else if(exp > 128) exp = 128;
	var sig = Math.round((af / Math.pow(2,exp) - 1) * 8388608) & 8388607;
	return (f < 0?-2147483648:0) | exp + 127 << 23 | sig;
};
haxe_io_FPHelper.i64ToDouble = function(low,high) {
	var sign = 1 - (high >>> 31 << 1);
	var exp = (high >> 20 & 2047) - 1023;
	var sig = (high & 1048575) * 4294967296. + (low >>> 31) * 2147483648. + (low & 2147483647);
	if(sig == 0 && exp == -1023) return 0.0;
	return sign * (1.0 + Math.pow(2,-52) * sig) * Math.pow(2,exp);
};
haxe_io_FPHelper.doubleToI64 = function(v) {
	var i64 = haxe_io_FPHelper.i64tmp;
	if(v == 0) {
		i64.low = 0;
		i64.high = 0;
	} else {
		var av;
		if(v < 0) av = -v; else av = v;
		var exp = Math.floor(Math.log(av) / 0.6931471805599453);
		var sig;
		var v1 = (av / Math.pow(2,exp) - 1) * 4503599627370496.;
		sig = Math.round(v1);
		var sig_l = sig | 0;
		var sig_h = sig / 4294967296.0 | 0;
		i64.low = sig_l;
		i64.high = (v < 0?-2147483648:0) | exp + 1023 << 20 | sig_h;
	}
	return i64;
};
var highlightly_Highlightly = function() { };
highlightly_Highlightly.__name__ = true;
highlightly_Highlightly.highlight = function() {
	var elements = window.document.getElementsByClassName("prettyprint");
	var regexHTML = new EReg("</{0,1}([A-Z][A-Z0-9]*)\\b[^>]*>","gi");
	var regexHaxeKeywords = new EReg("^(?!(\\s*\t*//))(.*)\\b(break|case|cast|catch|class|continue|default|do|dynamic|else|enum|extends|extern|false|for|function|if|implements|import|in|inline|interface|never|new|null|override|package|private|public|return|static|super|switch|this|throw|trace|true|try|typedef|untyped|using|var|while){1}\\b","gim");
	var regexHaxeComments = new EReg("(//(.*))|(/\\*(\\*(?!/)|[^*])*\\*/)","igm");
	var _g = 0;
	while(_g < elements.length) {
		var element = elements[_g];
		++_g;
		var classList = element.classList;
		var html = StringTools.htmlUnescape(element.innerHTML);
		if(classList.contains("html")) element.innerHTML = regexHTML.map(html,highlightly_Highlightly.matchKeyword); else if(classList.contains("haxe")) {
			html = StringTools.htmlUnescape(regexHaxeKeywords.map(html,highlightly_Highlightly.matchKeyword));
			element.innerHTML = regexHaxeComments.map(html,highlightly_Highlightly.matchComment);
		}
	}
};
highlightly_Highlightly.matchKeyword = function(regex) {
	var match = regex.matched(0);
	return "<span class=\"keyword\">" + StringTools.htmlEscape(match) + "</span>";
};
highlightly_Highlightly.matchComment = function(regex) {
	var match = regex.matched(0);
	return "<span class=\"comment\">" + StringTools.htmlEscape(match) + "</span>";
};
var js__$Boot_HaxeError = function(val) {
	Error.call(this);
	this.val = val;
	this.message = String(val);
	if(Error.captureStackTrace) Error.captureStackTrace(this,js__$Boot_HaxeError);
};
js__$Boot_HaxeError.__name__ = true;
js__$Boot_HaxeError.__super__ = Error;
js__$Boot_HaxeError.prototype = $extend(Error.prototype,{
	__class__: js__$Boot_HaxeError
});
var js_Boot = function() { };
js_Boot.__name__ = true;
js_Boot.getClass = function(o) {
	if((o instanceof Array) && o.__enum__ == null) return Array; else {
		var cl = o.__class__;
		if(cl != null) return cl;
		var name = js_Boot.__nativeClassName(o);
		if(name != null) return js_Boot.__resolveNativeClass(name);
		return null;
	}
};
js_Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) return o[0];
				var str2 = o[0] + "(";
				s += "\t";
				var _g1 = 2;
				var _g = o.length;
				while(_g1 < _g) {
					var i1 = _g1++;
					if(i1 != 2) str2 += "," + js_Boot.__string_rec(o[i1],s); else str2 += js_Boot.__string_rec(o[i1],s);
				}
				return str2 + ")";
			}
			var l = o.length;
			var i;
			var str1 = "[";
			s += "\t";
			var _g2 = 0;
			while(_g2 < l) {
				var i2 = _g2++;
				str1 += (i2 > 0?",":"") + js_Boot.__string_rec(o[i2],s);
			}
			str1 += "]";
			return str1;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			if (e instanceof js__$Boot_HaxeError) e = e.val;
			return "???";
		}
		if(tostr != null && tostr != Object.toString && typeof(tostr) == "function") {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) {
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str.length != 2) str += ", \n";
		str += s + k + " : " + js_Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str += "\n" + s + "}";
		return str;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
};
js_Boot.__interfLoop = function(cc,cl) {
	if(cc == null) return false;
	if(cc == cl) return true;
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g1 = 0;
		var _g = intf.length;
		while(_g1 < _g) {
			var i = _g1++;
			var i1 = intf[i];
			if(i1 == cl || js_Boot.__interfLoop(i1,cl)) return true;
		}
	}
	return js_Boot.__interfLoop(cc.__super__,cl);
};
js_Boot.__instanceof = function(o,cl) {
	if(cl == null) return false;
	switch(cl) {
	case Int:
		return (o|0) === o;
	case Float:
		return typeof(o) == "number";
	case Bool:
		return typeof(o) == "boolean";
	case String:
		return typeof(o) == "string";
	case Array:
		return (o instanceof Array) && o.__enum__ == null;
	case Dynamic:
		return true;
	default:
		if(o != null) {
			if(typeof(cl) == "function") {
				if(o instanceof cl) return true;
				if(js_Boot.__interfLoop(js_Boot.getClass(o),cl)) return true;
			} else if(typeof(cl) == "object" && js_Boot.__isNativeObj(cl)) {
				if(o instanceof cl) return true;
			}
		} else return false;
		if(cl == Class && o.__name__ != null) return true;
		if(cl == Enum && o.__ename__ != null) return true;
		return o.__enum__ == cl;
	}
};
js_Boot.__nativeClassName = function(o) {
	var name = js_Boot.__toStr.call(o).slice(8,-1);
	if(name == "Object" || name == "Function" || name == "Math" || name == "JSON") return null;
	return name;
};
js_Boot.__isNativeObj = function(o) {
	return js_Boot.__nativeClassName(o) != null;
};
js_Boot.__resolveNativeClass = function(name) {
	return (Function("return typeof " + name + " != \"undefined\" ? " + name + " : null"))();
};
var js_Browser = function() { };
js_Browser.__name__ = true;
js_Browser.createXMLHttpRequest = function() {
	if(typeof XMLHttpRequest != "undefined") return new XMLHttpRequest();
	if(typeof ActiveXObject != "undefined") return new ActiveXObject("Microsoft.XMLHTTP");
	throw new js__$Boot_HaxeError("Unable to create XMLHttpRequest object.");
};
var js_html_compat_ArrayBuffer = function(a) {
	if((a instanceof Array) && a.__enum__ == null) {
		this.a = a;
		this.byteLength = a.length;
	} else {
		var len = a;
		this.a = [];
		var _g = 0;
		while(_g < len) {
			var i = _g++;
			this.a[i] = 0;
		}
		this.byteLength = len;
	}
};
js_html_compat_ArrayBuffer.__name__ = true;
js_html_compat_ArrayBuffer.sliceImpl = function(begin,end) {
	var u = new Uint8Array(this,begin,end == null?null:end - begin);
	var result = new ArrayBuffer(u.byteLength);
	var resultArray = new Uint8Array(result);
	resultArray.set(u);
	return result;
};
js_html_compat_ArrayBuffer.prototype = {
	slice: function(begin,end) {
		return new js_html_compat_ArrayBuffer(this.a.slice(begin,end));
	}
	,__class__: js_html_compat_ArrayBuffer
};
var js_html_compat_DataView = function(buffer,byteOffset,byteLength) {
	this.buf = buffer;
	if(byteOffset == null) this.offset = 0; else this.offset = byteOffset;
	if(byteLength == null) this.length = buffer.byteLength - this.offset; else this.length = byteLength;
	if(this.offset < 0 || this.length < 0 || this.offset + this.length > buffer.byteLength) throw new js__$Boot_HaxeError(haxe_io_Error.OutsideBounds);
};
js_html_compat_DataView.__name__ = true;
js_html_compat_DataView.prototype = {
	getInt8: function(byteOffset) {
		var v = this.buf.a[this.offset + byteOffset];
		if(v >= 128) return v - 256; else return v;
	}
	,getUint8: function(byteOffset) {
		return this.buf.a[this.offset + byteOffset];
	}
	,getInt16: function(byteOffset,littleEndian) {
		var v = this.getUint16(byteOffset,littleEndian);
		if(v >= 32768) return v - 65536; else return v;
	}
	,getUint16: function(byteOffset,littleEndian) {
		if(littleEndian) return this.buf.a[this.offset + byteOffset] | this.buf.a[this.offset + byteOffset + 1] << 8; else return this.buf.a[this.offset + byteOffset] << 8 | this.buf.a[this.offset + byteOffset + 1];
	}
	,getInt32: function(byteOffset,littleEndian) {
		var p = this.offset + byteOffset;
		var a = this.buf.a[p++];
		var b = this.buf.a[p++];
		var c = this.buf.a[p++];
		var d = this.buf.a[p++];
		if(littleEndian) return a | b << 8 | c << 16 | d << 24; else return d | c << 8 | b << 16 | a << 24;
	}
	,getUint32: function(byteOffset,littleEndian) {
		var v = this.getInt32(byteOffset,littleEndian);
		if(v < 0) return v + 4294967296.; else return v;
	}
	,getFloat32: function(byteOffset,littleEndian) {
		return haxe_io_FPHelper.i32ToFloat(this.getInt32(byteOffset,littleEndian));
	}
	,getFloat64: function(byteOffset,littleEndian) {
		var a = this.getInt32(byteOffset,littleEndian);
		var b = this.getInt32(byteOffset + 4,littleEndian);
		return haxe_io_FPHelper.i64ToDouble(littleEndian?a:b,littleEndian?b:a);
	}
	,setInt8: function(byteOffset,value) {
		if(value < 0) this.buf.a[byteOffset + this.offset] = value + 128 & 255; else this.buf.a[byteOffset + this.offset] = value & 255;
	}
	,setUint8: function(byteOffset,value) {
		this.buf.a[byteOffset + this.offset] = value & 255;
	}
	,setInt16: function(byteOffset,value,littleEndian) {
		this.setUint16(byteOffset,value < 0?value + 65536:value,littleEndian);
	}
	,setUint16: function(byteOffset,value,littleEndian) {
		var p = byteOffset + this.offset;
		if(littleEndian) {
			this.buf.a[p] = value & 255;
			this.buf.a[p++] = value >> 8 & 255;
		} else {
			this.buf.a[p++] = value >> 8 & 255;
			this.buf.a[p] = value & 255;
		}
	}
	,setInt32: function(byteOffset,value,littleEndian) {
		this.setUint32(byteOffset,value,littleEndian);
	}
	,setUint32: function(byteOffset,value,littleEndian) {
		var p = byteOffset + this.offset;
		if(littleEndian) {
			this.buf.a[p++] = value & 255;
			this.buf.a[p++] = value >> 8 & 255;
			this.buf.a[p++] = value >> 16 & 255;
			this.buf.a[p++] = value >>> 24;
		} else {
			this.buf.a[p++] = value >>> 24;
			this.buf.a[p++] = value >> 16 & 255;
			this.buf.a[p++] = value >> 8 & 255;
			this.buf.a[p++] = value & 255;
		}
	}
	,setFloat32: function(byteOffset,value,littleEndian) {
		this.setUint32(byteOffset,haxe_io_FPHelper.floatToI32(value),littleEndian);
	}
	,setFloat64: function(byteOffset,value,littleEndian) {
		var i64 = haxe_io_FPHelper.doubleToI64(value);
		if(littleEndian) {
			this.setUint32(byteOffset,i64.low);
			this.setUint32(byteOffset,i64.high);
		} else {
			this.setUint32(byteOffset,i64.high);
			this.setUint32(byteOffset,i64.low);
		}
	}
	,__class__: js_html_compat_DataView
};
var js_html_compat_Uint8Array = function() { };
js_html_compat_Uint8Array.__name__ = true;
js_html_compat_Uint8Array._new = function(arg1,offset,length) {
	var arr;
	if(typeof(arg1) == "number") {
		arr = [];
		var _g = 0;
		while(_g < arg1) {
			var i = _g++;
			arr[i] = 0;
		}
		arr.byteLength = arr.length;
		arr.byteOffset = 0;
		arr.buffer = new js_html_compat_ArrayBuffer(arr);
	} else if(js_Boot.__instanceof(arg1,js_html_compat_ArrayBuffer)) {
		var buffer = arg1;
		if(offset == null) offset = 0;
		if(length == null) length = buffer.byteLength - offset;
		if(offset == 0) arr = buffer.a; else arr = buffer.a.slice(offset,offset + length);
		arr.byteLength = arr.length;
		arr.byteOffset = offset;
		arr.buffer = buffer;
	} else if((arg1 instanceof Array) && arg1.__enum__ == null) {
		arr = arg1.slice();
		arr.byteLength = arr.length;
		arr.byteOffset = 0;
		arr.buffer = new js_html_compat_ArrayBuffer(arr);
	} else throw new js__$Boot_HaxeError("TODO " + Std.string(arg1));
	arr.subarray = js_html_compat_Uint8Array._subarray;
	arr.set = js_html_compat_Uint8Array._set;
	return arr;
};
js_html_compat_Uint8Array._set = function(arg,offset) {
	var t = this;
	if(js_Boot.__instanceof(arg.buffer,js_html_compat_ArrayBuffer)) {
		var a = arg;
		if(arg.byteLength + offset > t.byteLength) throw new js__$Boot_HaxeError("set() outside of range");
		var _g1 = 0;
		var _g = arg.byteLength;
		while(_g1 < _g) {
			var i = _g1++;
			t[i + offset] = a[i];
		}
	} else if((arg instanceof Array) && arg.__enum__ == null) {
		var a1 = arg;
		if(a1.length + offset > t.byteLength) throw new js__$Boot_HaxeError("set() outside of range");
		var _g11 = 0;
		var _g2 = a1.length;
		while(_g11 < _g2) {
			var i1 = _g11++;
			t[i1 + offset] = a1[i1];
		}
	} else throw new js__$Boot_HaxeError("TODO");
};
js_html_compat_Uint8Array._subarray = function(start,end) {
	var t = this;
	var a = js_html_compat_Uint8Array._new(t.slice(start,end));
	a.byteOffset = start;
	return a;
};
var markdown_Node = function() { };
markdown_Node.__name__ = true;
markdown_Node.prototype = {
	__class__: markdown_Node
};
var markdown_NodeVisitor = function() { };
markdown_NodeVisitor.__name__ = true;
markdown_NodeVisitor.prototype = {
	__class__: markdown_NodeVisitor
};
var markdown_ElementNode = function(tag,children) {
	this.tag = tag;
	this.children = children;
	this.attributes = new haxe_ds_StringMap();
};
markdown_ElementNode.__name__ = true;
markdown_ElementNode.__interfaces__ = [markdown_Node];
markdown_ElementNode.empty = function(tag) {
	return new markdown_ElementNode(tag,null);
};
markdown_ElementNode.withTag = function(tag) {
	return new markdown_ElementNode(tag,[]);
};
markdown_ElementNode.text = function(tag,text) {
	return new markdown_ElementNode(tag,[new markdown_TextNode(text)]);
};
markdown_ElementNode.prototype = {
	isEmpty: function() {
		return this.children == null;
	}
	,accept: function(visitor) {
		if(visitor.visitElementBefore(this)) {
			var _g = 0;
			var _g1 = this.children;
			while(_g < _g1.length) {
				var child = _g1[_g];
				++_g;
				child.accept(visitor);
			}
			visitor.visitElementAfter(this);
		}
	}
	,__class__: markdown_ElementNode
};
var markdown_TextNode = function(text) {
	this.text = text;
};
markdown_TextNode.__name__ = true;
markdown_TextNode.__interfaces__ = [markdown_Node];
markdown_TextNode.prototype = {
	accept: function(visitor) {
		visitor.visitText(this);
	}
	,__class__: markdown_TextNode
};
var markdown_BlockParser = function(lines,document) {
	this.lines = lines;
	this.document = document;
	this.pos = 0;
};
markdown_BlockParser.__name__ = true;
markdown_BlockParser.prototype = {
	get_current: function() {
		return this.lines[this.pos];
	}
	,get_next: function() {
		if(this.pos >= this.lines.length - 1) return null;
		return this.lines[this.pos + 1];
	}
	,advance: function() {
		this.pos++;
	}
	,get_isDone: function() {
		return this.pos >= this.lines.length;
	}
	,matches: function(ereg) {
		if(this.pos >= this.lines.length) return false;
		return ereg.match(this.lines[this.pos]);
	}
	,matchesNext: function(ereg) {
		if(this.get_next() == null) return false;
		return ereg.match(this.get_next());
	}
	,__class__: markdown_BlockParser
};
var markdown_BlockSyntax = function() {
};
markdown_BlockSyntax.__name__ = true;
markdown_BlockSyntax.get_syntaxes = function() {
	if(markdown_BlockSyntax.syntaxes == null) markdown_BlockSyntax.syntaxes = [new markdown_EmptyBlockSyntax(),new markdown_BlockHtmlSyntax(),new markdown_SetextHeaderSyntax(),new markdown_HeaderSyntax(),new markdown_CodeBlockSyntax(),new markdown_GitHubCodeBlockSyntax(),new markdown_BlockquoteSyntax(),new markdown_HorizontalRuleSyntax(),new markdown_UnorderedListSyntax(),new markdown_OrderedListSyntax(),new markdown_TableSyntax(),new markdown_ParagraphSyntax()];
	return markdown_BlockSyntax.syntaxes;
};
markdown_BlockSyntax.isAtBlockEnd = function(parser) {
	if(parser.pos >= parser.lines.length) return true;
	var _g = 0;
	var _g1 = markdown_BlockSyntax.get_syntaxes();
	while(_g < _g1.length) {
		var syntax = _g1[_g];
		++_g;
		if(syntax.canParse(parser) && syntax.get_canEndBlock()) return true;
	}
	return false;
};
markdown_BlockSyntax.prototype = {
	get_pattern: function() {
		return null;
	}
	,get_canEndBlock: function() {
		return true;
	}
	,canParse: function(parser) {
		return this.get_pattern().match(parser.lines[parser.pos]);
	}
	,parse: function(parser) {
		return null;
	}
	,parseChildLines: function(parser) {
		var childLines = [];
		while(!(parser.pos >= parser.lines.length)) {
			if(!this.get_pattern().match(parser.lines[parser.pos])) break;
			childLines.push(this.get_pattern().matched(1));
			parser.advance();
		}
		return childLines;
	}
	,__class__: markdown_BlockSyntax
};
var markdown_EmptyBlockSyntax = function() {
	markdown_BlockSyntax.call(this);
};
markdown_EmptyBlockSyntax.__name__ = true;
markdown_EmptyBlockSyntax.__super__ = markdown_BlockSyntax;
markdown_EmptyBlockSyntax.prototype = $extend(markdown_BlockSyntax.prototype,{
	get_pattern: function() {
		return markdown_BlockSyntax.RE_EMPTY;
	}
	,parse: function(parser) {
		parser.advance();
		return null;
	}
	,__class__: markdown_EmptyBlockSyntax
});
var markdown_SetextHeaderSyntax = function() {
	markdown_BlockSyntax.call(this);
};
markdown_SetextHeaderSyntax.__name__ = true;
markdown_SetextHeaderSyntax.__super__ = markdown_BlockSyntax;
markdown_SetextHeaderSyntax.prototype = $extend(markdown_BlockSyntax.prototype,{
	canParse: function(parser) {
		return parser.matchesNext(markdown_BlockSyntax.RE_SETEXT);
	}
	,parse: function(parser) {
		var re = markdown_BlockSyntax.RE_SETEXT;
		re.match(parser.get_next());
		var tag;
		if(re.matched(1).charAt(0) == "=") tag = "h1"; else tag = "h2";
		var contents = parser.document.parseInline(parser.lines[parser.pos]);
		parser.advance();
		parser.advance();
		return new markdown_ElementNode(tag,contents);
	}
	,__class__: markdown_SetextHeaderSyntax
});
var markdown_HeaderSyntax = function() {
	markdown_BlockSyntax.call(this);
};
markdown_HeaderSyntax.__name__ = true;
markdown_HeaderSyntax.__super__ = markdown_BlockSyntax;
markdown_HeaderSyntax.prototype = $extend(markdown_BlockSyntax.prototype,{
	get_pattern: function() {
		return markdown_BlockSyntax.RE_HEADER;
	}
	,parse: function(parser) {
		this.get_pattern().match(parser.lines[parser.pos]);
		parser.advance();
		var level = this.get_pattern().matched(1).length;
		var contents = parser.document.parseInline(StringTools.trim(this.get_pattern().matched(2)));
		return new markdown_ElementNode("h" + level,contents);
	}
	,__class__: markdown_HeaderSyntax
});
var markdown_BlockquoteSyntax = function() {
	markdown_BlockSyntax.call(this);
};
markdown_BlockquoteSyntax.__name__ = true;
markdown_BlockquoteSyntax.__super__ = markdown_BlockSyntax;
markdown_BlockquoteSyntax.prototype = $extend(markdown_BlockSyntax.prototype,{
	get_pattern: function() {
		return markdown_BlockSyntax.RE_BLOCKQUOTE;
	}
	,parseChildLines: function(parser) {
		var childLines = [];
		while(!(parser.pos >= parser.lines.length)) if(this.get_pattern().match(parser.lines[parser.pos])) {
			childLines.push(this.get_pattern().matched(1));
			parser.advance();
		} else {
			var nextMatch;
			if(parser.get_next() != null) nextMatch = this.get_pattern().match(parser.get_next()); else nextMatch = false;
			if(StringTools.trim(parser.lines[parser.pos]) == "" && nextMatch) {
				childLines.push("");
				childLines.push(this.get_pattern().matched(1));
				parser.advance();
				parser.advance();
			} else break;
		}
		return childLines;
	}
	,parse: function(parser) {
		var childLines = this.parseChildLines(parser);
		var children = parser.document.parseLines(childLines);
		return new markdown_ElementNode("blockquote",children);
	}
	,__class__: markdown_BlockquoteSyntax
});
var markdown_CodeBlockSyntax = function() {
	markdown_BlockSyntax.call(this);
};
markdown_CodeBlockSyntax.__name__ = true;
markdown_CodeBlockSyntax.__super__ = markdown_BlockSyntax;
markdown_CodeBlockSyntax.prototype = $extend(markdown_BlockSyntax.prototype,{
	get_pattern: function() {
		return markdown_BlockSyntax.RE_INDENT;
	}
	,parseChildLines: function(parser) {
		var childLines = [];
		while(!(parser.pos >= parser.lines.length)) if(this.get_pattern().match(parser.lines[parser.pos])) {
			childLines.push(this.get_pattern().matched(1));
			parser.advance();
		} else {
			var nextMatch;
			if(parser.get_next() != null) nextMatch = this.get_pattern().match(parser.get_next()); else nextMatch = false;
			if(StringTools.trim(parser.lines[parser.pos]) == "" && nextMatch) {
				childLines.push("");
				childLines.push(this.get_pattern().matched(1));
				parser.advance();
				parser.advance();
			} else break;
		}
		return childLines;
	}
	,parse: function(parser) {
		var childLines = this.parseChildLines(parser);
		childLines.push("");
		var escaped = StringTools.htmlEscape(childLines.join("\n"));
		return new markdown_ElementNode("pre",[markdown_ElementNode.text("code",escaped)]);
	}
	,__class__: markdown_CodeBlockSyntax
});
var markdown_GitHubCodeBlockSyntax = function() {
	markdown_BlockSyntax.call(this);
};
markdown_GitHubCodeBlockSyntax.__name__ = true;
markdown_GitHubCodeBlockSyntax.__super__ = markdown_BlockSyntax;
markdown_GitHubCodeBlockSyntax.prototype = $extend(markdown_BlockSyntax.prototype,{
	get_pattern: function() {
		return markdown_BlockSyntax.RE_CODE;
	}
	,parseChildLines: function(parser) {
		var childLines = [];
		parser.advance();
		while(!(parser.pos >= parser.lines.length)) if(!this.get_pattern().match(parser.lines[parser.pos])) {
			childLines.push(parser.lines[parser.pos]);
			parser.advance();
		} else {
			parser.advance();
			break;
		}
		return childLines;
	}
	,parse: function(parser) {
		var syntax = this.get_pattern().matched(1);
		var childLines = this.parseChildLines(parser);
		var code = markdown_ElementNode.text("code",StringTools.htmlEscape(childLines.join("\n")));
		if(syntax != null && syntax.length > 0) code.attributes.set("class","prettyprint " + syntax);
		return new markdown_ElementNode("pre",[code]);
	}
	,__class__: markdown_GitHubCodeBlockSyntax
});
var markdown_HorizontalRuleSyntax = function() {
	markdown_BlockSyntax.call(this);
};
markdown_HorizontalRuleSyntax.__name__ = true;
markdown_HorizontalRuleSyntax.__super__ = markdown_BlockSyntax;
markdown_HorizontalRuleSyntax.prototype = $extend(markdown_BlockSyntax.prototype,{
	get_pattern: function() {
		return markdown_BlockSyntax.RE_HR;
	}
	,parse: function(parser) {
		parser.advance();
		return markdown_ElementNode.empty("hr");
	}
	,__class__: markdown_HorizontalRuleSyntax
});
var markdown_BlockHtmlSyntax = function() {
	markdown_BlockSyntax.call(this);
};
markdown_BlockHtmlSyntax.__name__ = true;
markdown_BlockHtmlSyntax.__super__ = markdown_BlockSyntax;
markdown_BlockHtmlSyntax.prototype = $extend(markdown_BlockSyntax.prototype,{
	get_pattern: function() {
		return markdown_BlockSyntax.RE_HTML;
	}
	,get_canEndBlock: function() {
		return false;
	}
	,parse: function(parser) {
		var childLines = [];
		while(!(parser.pos >= parser.lines.length) && !parser.matches(markdown_BlockSyntax.RE_EMPTY)) {
			childLines.push(parser.lines[parser.pos]);
			parser.advance();
		}
		return new markdown_TextNode(childLines.join("\n"));
	}
	,__class__: markdown_BlockHtmlSyntax
});
var markdown_ListItem = function(lines) {
	this.forceBlock = false;
	this.lines = lines;
};
markdown_ListItem.__name__ = true;
markdown_ListItem.prototype = {
	__class__: markdown_ListItem
};
var markdown_ParagraphSyntax = function() {
	markdown_BlockSyntax.call(this);
};
markdown_ParagraphSyntax.__name__ = true;
markdown_ParagraphSyntax.__super__ = markdown_BlockSyntax;
markdown_ParagraphSyntax.prototype = $extend(markdown_BlockSyntax.prototype,{
	get_canEndBlock: function() {
		return false;
	}
	,canParse: function(parser) {
		return true;
	}
	,parse: function(parser) {
		var childLines = [];
		while(!markdown_BlockSyntax.isAtBlockEnd(parser)) {
			childLines.push(StringTools.ltrim(parser.lines[parser.pos]));
			parser.advance();
		}
		var contents = parser.document.parseInline(childLines.join("\n"));
		return new markdown_ElementNode("p",contents);
	}
	,__class__: markdown_ParagraphSyntax
});
var markdown_ListSyntax = function(listTag) {
	markdown_BlockSyntax.call(this);
	this.listTag = listTag;
};
markdown_ListSyntax.__name__ = true;
markdown_ListSyntax.__super__ = markdown_BlockSyntax;
markdown_ListSyntax.prototype = $extend(markdown_BlockSyntax.prototype,{
	get_canEndBlock: function() {
		return false;
	}
	,parse: function(parser) {
		var items = [];
		var childLines = [];
		var endItem = function() {
			if(childLines.length > 0) {
				items.push(new markdown_ListItem(childLines));
				childLines = [];
			}
		};
		var match;
		var tryMatch = function(pattern) {
			match = pattern;
			return pattern.match(parser.lines[parser.pos]);
		};
		while(!(parser.pos >= parser.lines.length)) {
			if(tryMatch(markdown_BlockSyntax.RE_EMPTY)) childLines.push(""); else if(tryMatch(markdown_BlockSyntax.RE_UL) || tryMatch(markdown_BlockSyntax.RE_OL)) {
				endItem();
				childLines.push(match.matched(1));
			} else if(tryMatch(markdown_BlockSyntax.RE_INDENT)) childLines.push(match.matched(1)); else if(markdown_BlockSyntax.isAtBlockEnd(parser)) break; else {
				if(childLines.length > 0 && childLines[childLines.length - 1] == "") break;
				childLines.push(parser.lines[parser.pos]);
			}
			parser.advance();
		}
		endItem();
		var _g1 = 0;
		var _g = items.length;
		while(_g1 < _g) {
			var i = _g1++;
			var len = items[i].lines.length;
			var _g3 = 1;
			var _g2 = len + 1;
			while(_g3 < _g2) {
				var jj = _g3++;
				var j = len - jj;
				if(markdown_BlockSyntax.RE_EMPTY.match(items[i].lines[j])) {
					if(i < items.length - 1) {
						items[i].forceBlock = true;
						items[i + 1].forceBlock = true;
					}
					items[i].lines.pop();
				} else break;
			}
		}
		var itemNodes = [];
		var _g4 = 0;
		while(_g4 < items.length) {
			var item = items[_g4];
			++_g4;
			var blockItem = item.forceBlock || item.lines.length > 1;
			var blocksInList = [markdown_BlockSyntax.RE_BLOCKQUOTE,markdown_BlockSyntax.RE_HEADER,markdown_BlockSyntax.RE_HR,markdown_BlockSyntax.RE_INDENT,markdown_BlockSyntax.RE_UL,markdown_BlockSyntax.RE_OL];
			if(!blockItem) {
				var _g11 = 0;
				while(_g11 < blocksInList.length) {
					var pattern1 = blocksInList[_g11];
					++_g11;
					if(pattern1.match(item.lines[0])) {
						blockItem = true;
						break;
					}
				}
			}
			if(blockItem) {
				var children = parser.document.parseLines(item.lines);
				if(!item.forceBlock && children.length == 1) {
					if(js_Boot.__instanceof(children[0],markdown_ElementNode)) {
						var node = children[0];
						if(node.tag == "p") children = node.children;
					}
				}
				itemNodes.push(new markdown_ElementNode("li",children));
			} else {
				var contents = parser.document.parseInline(item.lines[0]);
				itemNodes.push(new markdown_ElementNode("li",contents));
			}
		}
		return new markdown_ElementNode(this.listTag,itemNodes);
	}
	,__class__: markdown_ListSyntax
});
var markdown_UnorderedListSyntax = function() {
	markdown_ListSyntax.call(this,"ul");
};
markdown_UnorderedListSyntax.__name__ = true;
markdown_UnorderedListSyntax.__super__ = markdown_ListSyntax;
markdown_UnorderedListSyntax.prototype = $extend(markdown_ListSyntax.prototype,{
	get_pattern: function() {
		return markdown_BlockSyntax.RE_UL;
	}
	,__class__: markdown_UnorderedListSyntax
});
var markdown_OrderedListSyntax = function() {
	markdown_ListSyntax.call(this,"ol");
};
markdown_OrderedListSyntax.__name__ = true;
markdown_OrderedListSyntax.__super__ = markdown_ListSyntax;
markdown_OrderedListSyntax.prototype = $extend(markdown_ListSyntax.prototype,{
	get_pattern: function() {
		return markdown_BlockSyntax.RE_OL;
	}
	,__class__: markdown_OrderedListSyntax
});
var markdown_TableSyntax = function() {
	markdown_BlockSyntax.call(this);
};
markdown_TableSyntax.__name__ = true;
markdown_TableSyntax.__super__ = markdown_BlockSyntax;
markdown_TableSyntax.prototype = $extend(markdown_BlockSyntax.prototype,{
	get_pattern: function() {
		return markdown_TableSyntax.TABLE_PATTERN;
	}
	,get_canEndBlock: function() {
		return false;
	}
	,parse: function(parser) {
		var lines = [];
		while(!(parser.pos >= parser.lines.length) && parser.matches(markdown_TableSyntax.TABLE_PATTERN)) {
			lines.push(parser.lines[parser.pos]);
			parser.advance();
		}
		var heads = [];
		var rows = [];
		var align = [];
		var headLine = lines.shift();
		var alignLine = lines.shift();
		var aligns = [];
		if(alignLine != null) markdown_TableSyntax.CELL_PATTERN.map(alignLine,function(e) {
			var text = e.matched(2);
			var align1;
			if(text.charAt(0) == ":") {
				if(text.charAt(text.length - 1) == ":") align1 = "center"; else align1 = "left";
			} else if(text.charAt(text.length - 1) == ":") align1 = "right"; else align1 = "left";
			aligns.push(align1);
			return "";
		});
		var index = 0;
		markdown_TableSyntax.CELL_PATTERN.map(headLine,function(e1) {
			var text1 = StringTools.trim(e1.matched(2));
			var cell = new markdown_ElementNode("th",parser.document.parseInline(text1));
			if(aligns[index] != "left") cell.attributes.set("align",aligns[index]);
			heads.push(cell);
			index += 1;
			return "";
		});
		var _g = 0;
		while(_g < lines.length) {
			var line = lines[_g];
			++_g;
			var cols = [[]];
			rows.push(new markdown_ElementNode("tr",cols[0]));
			var index1 = [0];
			markdown_TableSyntax.CELL_PATTERN.map(line,(function(index1,cols) {
				return function(e2) {
					var text2 = StringTools.trim(e2.matched(2));
					var cell1 = new markdown_ElementNode("td",parser.document.parseInline(text2));
					if(aligns[index1[0]] != "left") cell1.attributes.set("align",aligns[index1[0]]);
					cols[0].push(cell1);
					index1[0] += 1;
					return "";
				};
			})(index1,cols));
		}
		return new markdown_ElementNode("table",[new markdown_ElementNode("thead",heads),new markdown_ElementNode("tbody",rows)]);
	}
	,__class__: markdown_TableSyntax
});
var markdown_HtmlRenderer = function() {
};
markdown_HtmlRenderer.__name__ = true;
markdown_HtmlRenderer.__interfaces__ = [markdown_NodeVisitor];
markdown_HtmlRenderer.sortAttributes = function(a,b) {
	var ia = HxOverrides.indexOf(markdown_HtmlRenderer.attributeOrder,a,0);
	var ib = HxOverrides.indexOf(markdown_HtmlRenderer.attributeOrder,a,0);
	if(ia > -1 && ib > -1) return ia - ib;
	return Reflect.compare(a,b);
};
markdown_HtmlRenderer.prototype = {
	render: function(nodes) {
		this.buffer = new StringBuf();
		var _g = 0;
		while(_g < nodes.length) {
			var node = nodes[_g];
			++_g;
			node.accept(this);
		}
		return this.buffer.b;
	}
	,visitText: function(text) {
		if(text.text == null) this.buffer.b += "null"; else this.buffer.b += "" + text.text;
	}
	,visitElementBefore: function(element) {
		if(this.buffer.b != "" && markdown_HtmlRenderer.BLOCK_TAGS.match(element.tag)) this.buffer.b += "\n";
		this.buffer.b += Std.string("<" + element.tag);
		var attributeNames;
		var _g = [];
		var $it0 = element.attributes.keys();
		while( $it0.hasNext() ) {
			var k = $it0.next();
			_g.push(k);
		}
		attributeNames = _g;
		attributeNames.sort(markdown_HtmlRenderer.sortAttributes);
		var _g1 = 0;
		while(_g1 < attributeNames.length) {
			var name = attributeNames[_g1];
			++_g1;
			this.buffer.add(" " + name + "=\"" + element.attributes.get(name) + "\"");
		}
		if(element.children == null) {
			this.buffer.b += " />";
			return false;
		} else {
			this.buffer.b += ">";
			return true;
		}
	}
	,visitElementAfter: function(element) {
		this.buffer.b += Std.string("</" + element.tag + ">");
	}
	,__class__: markdown_HtmlRenderer
};
var markdown_InlineSyntax = function(pattern) {
	this.pattern = new EReg(pattern,"m");
};
markdown_InlineSyntax.__name__ = true;
markdown_InlineSyntax.prototype = {
	tryMatch: function(parser) {
		if(this.pattern.match(parser.get_currentSource()) && this.pattern.matchedPos().pos == 0) {
			parser.writeText();
			if(this.onMatch(parser)) parser.consume(this.pattern.matched(0).length);
			return true;
		}
		return false;
	}
	,onMatch: function(parser) {
		return false;
	}
	,__class__: markdown_InlineSyntax
};
var markdown_AutolinkSyntaxWithoutBrackets = function() {
	markdown_InlineSyntax.call(this,"\\b((http|https|ftp)://[^\\s]*)\\b");
};
markdown_AutolinkSyntaxWithoutBrackets.__name__ = true;
markdown_AutolinkSyntaxWithoutBrackets.__super__ = markdown_InlineSyntax;
markdown_AutolinkSyntaxWithoutBrackets.prototype = $extend(markdown_InlineSyntax.prototype,{
	tryMatch: function(parser) {
		return markdown_InlineSyntax.prototype.tryMatch.call(this,parser);
	}
	,onMatch: function(parser) {
		var url = this.pattern.matched(1);
		var anchor = markdown_ElementNode.text("a",StringTools.htmlEscape(url));
		anchor.attributes.set("href",url);
		parser.addNode(anchor);
		return true;
	}
	,__class__: markdown_AutolinkSyntaxWithoutBrackets
});
var markdown_TextSyntax = function(pattern,substitute) {
	markdown_InlineSyntax.call(this,pattern);
	this.substitute = substitute;
};
markdown_TextSyntax.__name__ = true;
markdown_TextSyntax.__super__ = markdown_InlineSyntax;
markdown_TextSyntax.prototype = $extend(markdown_InlineSyntax.prototype,{
	onMatch: function(parser) {
		if(this.substitute == null) {
			parser.advanceBy(this.pattern.matched(0).length);
			return false;
		}
		parser.addNode(parser.createText(this.substitute));
		return true;
	}
	,__class__: markdown_TextSyntax
});
var markdown_AutolinkSyntax = function() {
	markdown_InlineSyntax.call(this,"<((http|https|ftp)://[^>]*)>");
};
markdown_AutolinkSyntax.__name__ = true;
markdown_AutolinkSyntax.__super__ = markdown_InlineSyntax;
markdown_AutolinkSyntax.prototype = $extend(markdown_InlineSyntax.prototype,{
	onMatch: function(parser) {
		var url = this.pattern.matched(1);
		var anchor = markdown_ElementNode.text("a",StringTools.htmlEscape(url));
		anchor.attributes.set("href",url);
		parser.addNode(anchor);
		return true;
	}
	,__class__: markdown_AutolinkSyntax
});
var markdown_TagSyntax = function(pattern,tag,end) {
	markdown_InlineSyntax.call(this,pattern);
	this.tag = tag;
	this.endPattern = new EReg(end == null?pattern:end,"m");
};
markdown_TagSyntax.__name__ = true;
markdown_TagSyntax.__super__ = markdown_InlineSyntax;
markdown_TagSyntax.prototype = $extend(markdown_InlineSyntax.prototype,{
	onMatch: function(parser) {
		parser.stack.push(new markdown_TagState(parser.pos,parser.pos + this.pattern.matched(0).length,this));
		return true;
	}
	,onMatchEnd: function(parser,state) {
		parser.addNode(new markdown_ElementNode(this.tag,state.children));
		return true;
	}
	,__class__: markdown_TagSyntax
});
var markdown_LinkSyntax = function(linkResolver) {
	markdown_TagSyntax.call(this,"\\[",null,markdown_LinkSyntax.linkPattern);
	this.linkResolver = linkResolver;
};
markdown_LinkSyntax.__name__ = true;
markdown_LinkSyntax.__super__ = markdown_TagSyntax;
markdown_LinkSyntax.prototype = $extend(markdown_TagSyntax.prototype,{
	onMatchEnd: function(parser,state) {
		var url;
		var title;
		if(this.endPattern.matched(1) == null || this.endPattern.matched(1) == "") {
			if(this.linkResolver == null) return false;
			if(state.children.length != 1) return false;
			if(!js_Boot.__instanceof(state.children[0],markdown_TextNode)) return false;
			var link = state.children[0];
			var node = this.linkResolver(link.text);
			if(node == null) return false;
			parser.addNode(node);
			return true;
		}
		if(this.endPattern.matched(3) != null && this.endPattern.matched(3) != "") {
			url = this.endPattern.matched(3);
			title = this.endPattern.matched(4);
			if(StringTools.startsWith(url,"<") && StringTools.endsWith(url,">")) url = url.substring(1,url.length - 1);
		} else {
			var id = this.endPattern.matched(2);
			if(id == "") id = parser.source.substring(state.startPos + 1,parser.pos);
			id = id.toLowerCase();
			var link1 = parser.document.refLinks.get(id);
			if(link1 == null) return false;
			url = link1.url;
			title = link1.title;
		}
		var anchor = new markdown_ElementNode("a",state.children);
		var value = StringTools.htmlEscape(url);
		anchor.attributes.set("href",value);
		if(title != null && title != "") {
			var value1 = StringTools.htmlEscape(title);
			anchor.attributes.set("title",value1);
		}
		parser.addNode(anchor);
		return true;
	}
	,__class__: markdown_LinkSyntax
});
var markdown_ImgSyntax = function(linkResolver) {
	markdown_TagSyntax.call(this,"!\\[",null,markdown_ImgSyntax.linkPattern);
	this.linkResolver = linkResolver;
};
markdown_ImgSyntax.__name__ = true;
markdown_ImgSyntax.__super__ = markdown_TagSyntax;
markdown_ImgSyntax.prototype = $extend(markdown_TagSyntax.prototype,{
	onMatchEnd: function(parser,state) {
		var url;
		var title;
		if(this.endPattern.matched(1) == null || this.endPattern.matched(1) == "") {
			if(this.linkResolver == null) return false;
			if(state.children.length != 1) return false;
			if(!js_Boot.__instanceof(state.children[0],markdown_TextNode)) return false;
			var link = state.children[0];
			var node = this.linkResolver(link.text);
			if(node == null) return false;
			parser.addNode(node);
			return true;
		}
		if(this.endPattern.matched(3) != null && this.endPattern.matched(3) != "") {
			url = this.endPattern.matched(3);
			title = this.endPattern.matched(4);
			if(StringTools.startsWith(url,"<") && StringTools.endsWith(url,">")) url = url.substring(1,url.length - 1);
		} else {
			var id = this.endPattern.matched(2);
			if(id == "") id = parser.source.substring(state.startPos + 1,parser.pos);
			id = id.toLowerCase();
			var link1 = parser.document.refLinks.get(id);
			if(link1 == null) return false;
			url = link1.url;
			title = link1.title;
		}
		var img = new markdown_ElementNode("img",null);
		var value = StringTools.htmlEscape(url);
		img.attributes.set("src",value);
		if(state.children.length == 1 && js_Boot.__instanceof(state.children[0],markdown_TextNode)) {
			var alt = state.children[0];
			img.attributes.set("alt",alt.text);
		}
		if(title != null && title != "") {
			var value1 = StringTools.htmlEscape(title);
			img.attributes.set("title",value1);
		}
		parser.addNode(img);
		return true;
	}
	,__class__: markdown_ImgSyntax
});
var markdown_CodeSyntax = function(pattern) {
	markdown_InlineSyntax.call(this,pattern);
};
markdown_CodeSyntax.__name__ = true;
markdown_CodeSyntax.__super__ = markdown_InlineSyntax;
markdown_CodeSyntax.prototype = $extend(markdown_InlineSyntax.prototype,{
	onMatch: function(parser) {
		parser.addNode(markdown_ElementNode.text("code",StringTools.htmlEscape(this.pattern.matched(1))));
		return true;
	}
	,__class__: markdown_CodeSyntax
});
var markdown_InlineParser = function(source,document) {
	this.start = 0;
	this.pos = 0;
	this.source = source;
	this.document = document;
	this.stack = [];
	if(document.inlineSyntaxes != null) {
		this.syntaxes = [];
		var _g = 0;
		var _g1 = document.inlineSyntaxes;
		while(_g < _g1.length) {
			var syntax = _g1[_g];
			++_g;
			this.syntaxes.push(syntax);
		}
		var _g2 = 0;
		var _g11 = markdown_InlineParser.defaultSyntaxes;
		while(_g2 < _g11.length) {
			var syntax1 = _g11[_g2];
			++_g2;
			this.syntaxes.push(syntax1);
		}
	} else this.syntaxes = markdown_InlineParser.defaultSyntaxes;
	var x = new markdown_LinkSyntax(document.linkResolver);
	this.syntaxes.splice(1,0,x);
};
markdown_InlineParser.__name__ = true;
markdown_InlineParser.prototype = {
	parse: function() {
		this.stack.push(new markdown_TagState(0,0,null));
		while(!this.get_isDone()) {
			var matched = false;
			var _g1 = 1;
			var _g = this.stack.length;
			while(_g1 < _g) {
				var i = _g1++;
				if(this.stack[this.stack.length - i].tryMatch(this)) {
					matched = true;
					break;
				}
			}
			if(matched) continue;
			var _g2 = 0;
			var _g11 = this.syntaxes;
			while(_g2 < _g11.length) {
				var syntax = _g11[_g2];
				++_g2;
				if(syntax.tryMatch(this)) {
					matched = true;
					break;
				}
			}
			if(matched) continue;
			this.advanceBy(1);
		}
		return this.stack[0].close(this);
	}
	,writeText: function() {
		this.writeTextRange(this.start,this.pos);
		this.start = this.pos;
	}
	,writeTextRange: function(start,end) {
		if(end > start) {
			var text = this.source.substring(start,end);
			var nodes = this.stack[this.stack.length - 1].children;
			if(nodes.length > 0 && js_Boot.__instanceof(nodes[nodes.length - 1],markdown_TextNode)) {
				var lastNode = nodes[nodes.length - 1];
				var newNode = this.createText("" + lastNode.text + text);
				nodes[nodes.length - 1] = newNode;
			} else nodes.push(this.createText(text));
		}
	}
	,createText: function(text) {
		return new markdown_TextNode(this.unescape(text));
	}
	,addNode: function(node) {
		this.stack[this.stack.length - 1].children.push(node);
	}
	,get_currentSource: function() {
		return this.source.substring(this.pos,this.source.length);
	}
	,get_isDone: function() {
		return this.pos == this.source.length;
	}
	,advanceBy: function(length) {
		this.pos += length;
	}
	,consume: function(length) {
		this.pos += length;
		this.start = this.pos;
	}
	,unescape: function(text) {
		text = new EReg("\\\\([\\\\`*_{}[\\]()#+-.!])","g").replace(text,"$1");
		text = StringTools.replace(text,"\t","    ");
		return text;
	}
	,__class__: markdown_InlineParser
};
var markdown_TagState = function(startPos,endPos,syntax) {
	this.startPos = startPos;
	this.endPos = endPos;
	this.syntax = syntax;
	this.children = [];
};
markdown_TagState.__name__ = true;
markdown_TagState.prototype = {
	tryMatch: function(parser) {
		if(this.syntax.endPattern.match(parser.get_currentSource()) && this.syntax.endPattern.matchedPos().pos == 0) {
			this.close(parser);
			return true;
		}
		return false;
	}
	,close: function(parser) {
		var index = HxOverrides.indexOf(parser.stack,this,0);
		var unmatchedTags = parser.stack.splice(index + 1,parser.stack.length - index);
		var _g = 0;
		while(_g < unmatchedTags.length) {
			var unmatched = unmatchedTags[_g];
			++_g;
			parser.writeTextRange(unmatched.startPos,unmatched.endPos);
			var _g1 = 0;
			var _g2 = unmatched.children;
			while(_g1 < _g2.length) {
				var child = _g2[_g1];
				++_g1;
				this.children.push(child);
			}
		}
		parser.writeText();
		parser.stack.pop();
		if(parser.stack.length == 0) return this.children;
		if(this.syntax.onMatchEnd(parser,this)) parser.consume(this.syntax.endPattern.matched(0).length); else {
			parser.start = this.startPos;
			parser.advanceBy(this.syntax.endPattern.matched(0).length);
		}
		return null;
	}
	,__class__: markdown_TagState
};
function $iterator(o) { if( o instanceof Array ) return function() { return HxOverrides.iter(o); }; return typeof(o.iterator) == 'function' ? $bind(o,o.iterator) : o.iterator; }
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
if(Array.prototype.indexOf) HxOverrides.indexOf = function(a,o,i) {
	return Array.prototype.indexOf.call(a,o,i);
};
String.prototype.__class__ = String;
String.__name__ = true;
Array.__name__ = true;
var Int = { __name__ : ["Int"]};
var Dynamic = { __name__ : ["Dynamic"]};
var Float = Number;
Float.__name__ = ["Float"];
var Bool = Boolean;
Bool.__ename__ = ["Bool"];
var Class = { __name__ : ["Class"]};
var Enum = { };
haxe_Resource.content = [{ name : "ArticlesTemplate", data : "PHVsPg0KOjpmb3JlYWNoIGFydGljbGVzOjoNCiAgPGxpPjxhIGhyZWY9IiMvY29udGVudHMvOjpfX2N1cnJlbnRfXy5wYXRoOjoiPjo6X19jdXJyZW50X18udGl0bGU6OjwvYT48YnIvPjxzcGFuIGNsYXNzPSJ0aW1lc3RhbXAiPjo6X19jdXJyZW50X18udGltZXN0YW1wOjo8L3NwYW4+PC9saT4NCjo6ZW5kOjoNCjwvdWw+"},{ name : "UserTemplate", data : "PGltZyBzcmM9Ijo6dXNlci5hdmF0YXI6OiIvPg0KPHA+SGVsbG8hIE15IG5hbWUgaXMgPHNwYW4+Ojp1c2VyLm5hbWU6Ojwvc3Bhbj4gKDxzcGFuPjo6dXNlci5sb2dpbjo6PC9zcGFuPiksIGFuZCBJIGhhaWwgZnJvbSA8c3Bhbj46OnVzZXIubG9jYXRpb246Ojwvc3Bhbj4uIEkgaGF2ZSBjb250cmlidXRlZCB0byA8c3Bhbj46OnVzZXIucmVwb3M6Ojwvc3Bhbj4gcmVwb3NpdG9yaWVzIHNvIGZhciwgd2l0aCBtb3JlIHRvIGNvbWUhPC9wPg0KPHA+SW4gc2hvcnQsIEkgYW0gYSBnZW5lcmFsaXN0IHdobyBlbmpveXMgbWFraW5nIHRoaW5ncyB3aXRoIEhheGUuPC9wPg0KPHA+Q29udGFjdCBtZSBhdCA8c3Bhbj46OnVzZXIuZW1haWw6Ojwvc3Bhbj4sIG9yIHZpc2l0IG15IDxhIGhyZWY9Ijo6dXNlci51cmw6OiI+R2l0SHViIHBhZ2U8L2E+LjwvcD4"},{ name : "ArticleTemplate", data : "PGRpdiBjbGFzcz0idGltZXN0YW1wIj5Xcml0dGVuIG9uIDo6YXJ0aWNsZS50aW1lc3RhbXA6OjwvZGl2Pg0KOjphcnRpY2xlLmJvZHk6Og"}];
var __map_reserved = {}
var ArrayBuffer = (Function("return typeof ArrayBuffer != 'undefined' ? ArrayBuffer : null"))() || js_html_compat_ArrayBuffer;
if(ArrayBuffer.prototype.slice == null) ArrayBuffer.prototype.slice = js_html_compat_ArrayBuffer.sliceImpl;
var DataView = (Function("return typeof DataView != 'undefined' ? DataView : null"))() || js_html_compat_DataView;
var Uint8Array = (Function("return typeof Uint8Array != 'undefined' ? Uint8Array : null"))() || js_html_compat_Uint8Array._new;
haxe_Template.splitter = new EReg("(::[A-Za-z0-9_ ()&|!+=/><*.\"-]+::|\\$\\$([A-Za-z0-9_-]+)\\()","");
haxe_Template.expr_splitter = new EReg("(\\(|\\)|[ \r\n\t]*\"[^\"]*\"[ \r\n\t]*|[!+=/><*.&|-]+)","");
haxe_Template.expr_trim = new EReg("^[ ]*([^ ]+)[ ]*$","");
haxe_Template.expr_int = new EReg("^[0-9]+$","");
haxe_Template.expr_float = new EReg("^([+-]?)(?=\\d|,\\d)\\d*(,\\d*)?([Ee]([+-]?\\d+))?$","");
haxe_Template.globals = { };
haxe_crypto_Base64.CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
haxe_crypto_Base64.BYTES = haxe_io_Bytes.ofString(haxe_crypto_Base64.CHARS);
haxe_io_FPHelper.i64tmp = (function($this) {
	var $r;
	var x = new haxe__$Int64__$_$_$Int64(0,0);
	$r = x;
	return $r;
}(this));
js_Boot.__toStr = {}.toString;
js_html_compat_Uint8Array.BYTES_PER_ELEMENT = 1;
markdown_BlockSyntax.RE_EMPTY = new EReg("^([ \\t]*)$","");
markdown_BlockSyntax.RE_SETEXT = new EReg("^((=+)|(-+))$","");
markdown_BlockSyntax.RE_HEADER = new EReg("^(#{1,6})(.*?)#*$","");
markdown_BlockSyntax.RE_BLOCKQUOTE = new EReg("^[ ]{0,3}>[ ]?(.*)$","");
markdown_BlockSyntax.RE_INDENT = new EReg("^(?:    |\t)(.*)$","");
markdown_BlockSyntax.RE_CODE = new EReg("^```(\\w*)\\s*$","");
markdown_BlockSyntax.RE_HR = new EReg("^[ ]{0,3}((-+[ ]{0,2}){3,}|(_+[ ]{0,2}){3,}|(\\*+[ ]{0,2}){3,})$","");
markdown_BlockSyntax.RE_HTML = new EReg("^<[ ]*\\w+[ >]","");
markdown_BlockSyntax.RE_UL = new EReg("^[ ]{0,3}[*+-][ \\t]+(.*)$","");
markdown_BlockSyntax.RE_OL = new EReg("^[ ]{0,3}\\d+\\.[ \\t]+(.*)$","");
markdown_TableSyntax.TABLE_PATTERN = new EReg("^(.+? +:?\\|:? +)+(.+)$","");
markdown_TableSyntax.CELL_PATTERN = new EReg("(\\|)?([^\\|]+)(\\|)?","g");
markdown_HtmlRenderer.BLOCK_TAGS = new EReg("blockquote|h1|h2|h3|h4|h5|h6|hr|p|pre","");
markdown_HtmlRenderer.attributeOrder = ["src","alt"];
markdown_LinkSyntax.linkPattern = "\\](?:(" + "\\s?\\[([^\\]]*)\\]" + "|" + "\\s?\\(([^ )]+)(?:[ ]*\"([^\"]+)\"|)\\)" + ")|)";
markdown_ImgSyntax.linkPattern = "\\](?:(" + "\\s?\\[([^\\]]*)\\]" + "|" + "\\s?\\(([^ )]+)(?:[ ]*\"([^\"]+)\"|)\\)" + ")|)";
markdown_InlineParser.defaultSyntaxes = [new markdown_AutolinkSyntaxWithoutBrackets(),new markdown_TextSyntax(" {2,}\n","<br />\n"),new markdown_TextSyntax("\\s*[A-Za-z0-9]+"),new markdown_AutolinkSyntax(),new markdown_LinkSyntax(),new markdown_ImgSyntax(),new markdown_TextSyntax(" \\* "),new markdown_TextSyntax(" _ "),new markdown_TextSyntax("&[#a-zA-Z0-9]*;"),new markdown_TextSyntax("&","&amp;"),new markdown_TextSyntax("</?\\w+.*?>"),new markdown_TextSyntax("<","&lt;"),new markdown_TagSyntax("\\*\\*","strong"),new markdown_TagSyntax("__","strong"),new markdown_TagSyntax("\\*","em"),new markdown_TagSyntax("\\b_","em","_\\b"),new markdown_CodeSyntax("``\\s?((?:.|\\n)*?)\\s?``"),new markdown_CodeSyntax("`([^`]*)`")];
gitblog_GitBlog.main();
})(typeof console != "undefined" ? console : {log:function(){}});
