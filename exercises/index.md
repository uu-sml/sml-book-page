<ul>
  {% for exercise in site.exercise2 %}
    <li>
      <a href="{{ exercise.url }}">{{ exercise.title }}</a>
    </li>
  {% endfor %}
</ul>
