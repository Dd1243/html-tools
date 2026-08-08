# -*- coding: utf-8 -*-
"""Shared HTML helpers for guide bodies."""

def p(*texts):
    return "".join(f"<p>{t}</p>\n" for t in texts)


def sec(sid, title, *bits):
    return f'<section id="{sid}">\n<h2>{title}</h2>\n' + "".join(bits) + "</section>\n"


def ul(items):
    return "<ul>\n" + "".join(f"<li>{i}</li>\n" for i in items) + "</ul>\n"


def ol(items):
    return "<ol>\n" + "".join(f"<li>{i}</li>\n" for i in items) + "</ol>\n"


def table(headers, rows):
    th = "".join(f"<th>{h}</th>" for h in headers)
    body = ""
    for r in rows:
        body += "<tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>\n"
    return (
        f'<table class="data-table"><thead><tr>{th}</tr></thead>'
        f"<tbody>\n{body}</tbody></table>\n"
    )


def code(s):
    return f'<pre class="code-block">{s}</pre>\n'


def callout(inner):
    return f'<div class="callout">{inner}</div>\n'


def key(title, bold, sub):
    return (
        f'<section class="card key-takeaway" id="tldr"><h2>{title}</h2>'
        f'<p><strong class="bold">{bold}</strong></p><p>{sub}</p></section>\n'
    )


def checklist(sid, title, items):
    return (
        f'<section class="checklist" id="{sid}"><h2>{title}</h2><ul>\n'
        + "".join(f"<li>{i}</li>\n" for i in items)
        + "</ul></section>\n"
    )


def tools(sid, title, cards):
    parts = [f'<section id="{sid}"><h2>{title}</h2><div class="tool-grid">\n']
    for href, t, d in cards:
        parts.append(
            f'<a class="tool-card" href="{href}"><strong>{t}</strong><span>{d}</span></a>\n'
        )
    parts.append("</div></section>\n")
    return "".join(parts)
