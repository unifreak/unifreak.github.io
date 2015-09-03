---
title: testing post one
layout: naked_md
---

#testing one

{% for i in (1..5) reversed limit:2 offset:2  %}
    {% if i == 5 %}
        {% break %}
    {% elsif i == 3 %}
        {% continue %}
    {% else %}
        {{ i }}
    {% endif %}
{% endfor %}

{% cycle 'one', 'two', 'three' %}
{% cycle 'one', 'two', 'three' %}

{% highlight python %}
def yourfunction():
     print "Hello World!"
{% endhighlight %}

```javascript
var info = 'info';
function info() {
    console.log(info);
    alert(1);
    alert(2);
}
```