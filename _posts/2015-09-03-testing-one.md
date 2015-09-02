---
title: testing post one
layout: default
---

#testing one

{{site.url}}

{{page.title}}

<ul>
  {% for post in site.posts %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a>
      {{ post.excerpt | strip_html }}
    </li>
  {% endfor %}
</ul>

{% highlight java linenos=table %}
public class HelloWorld {
    public static void main(String args[]) {
      System.out.println("Hello World!");
    }
}
{% endhighlight %}