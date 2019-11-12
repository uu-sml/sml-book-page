---
style: default
---

<ul>
  {% for e2 in site.exercises2 %}
    <li>
      <a href="{{ site.baseurl }}{{ e2.url }}">{{ e2.title }}</a>
    </li>
  {% endfor %}
</ul>
