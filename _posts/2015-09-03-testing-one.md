---
title: testing post one
---

#testing one

<ul>
  {% for post in site.posts %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a>
      {{ post.excerpt | strip_html }}
    </li>
  {% endfor %}
</ul>

    var str = 'some thing';
    var num = 1;

    function do() {
        return str + num;
    }

    do();
