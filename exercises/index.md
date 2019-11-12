<ul>
  {% for exercise in site.exercises2 %}
    <li>
      <a href="{{ exercise.url }}">{{ exercise.title }}</a>
    </li>
  {% endfor %}
</ul>
