let sidebar = document.getElementById('sidebar');
let tip = document.createElement('div')
let logo = document.createElement('div');
let menuicon = document.createElement('i');
let menutext = document.createElement('span');
let icon = document.createElement('i');

tip.className = "top";
logo.className = "logo";
menuicon.className = "bx bxl-codepen";
menutext.appendChild(document.createTextNode("Menu"));
icon.className = "bx bx-menu";
icon.id = "btn";

logo.appendChild(menuicon);
logo.appendChild(menutext);
tip.appendChild(logo);
tip.appendChild(icon);
sidebar.appendChild(tip);

let items = [["index", "Home", "home"],
["about", "About me", "info-circle"],
["projecten", "Projecten", "edit-alt"],
["portfolio", "Portfolio", "file"],
["extra", "Extra", "chip"]];

let ul = document.createElement('ul');
ul.id = "nav";

items.forEach(el => {
  let li = document.createElement('li');
  let a = document.createElement('a');
  let i = document.createElement('i');
  let navitem = document.createElement('span');
  let tooltip = document.createElement('span');

  a.href = el[0] /* + ".html" */;
  i.className = "bx bxs-" + el[2];
  let text = document.createTextNode(el[1]);
  navitem.appendChild(text.cloneNode());
  tooltip.appendChild(text);
  navitem.className = "nav-item";
  tooltip.className = "tooltip";

  a.appendChild(i);
  a.appendChild(navitem);
  li.appendChild(a);
  li.appendChild(tooltip);
  ul.appendChild(li);
});

sidebar.append(ul);

icon.onclick = function () {
  sidebar.classList.toggle('active');
}