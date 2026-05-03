// import { fetchJSON, renderProjects } from '../global.js';

// const projects = await fetchJSON('../lib/projects.json');
// const projectsContainer = document.querySelector('.projects');

// renderProjects(projects, projectsContainer, 'h2');

// const title = document.querySelector('.projects-title');
// if (title) {
//   title.textContent = `Projects (${projects.length})`;
// }

import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const title = document.querySelector('.projects-title');
const searchInput = document.querySelector('.searchBar');

let query = '';
let selectedIndex = -1;
let currentData = [];

if (title) {
  title.textContent = `Projects (${projects.length})`;
}

function getFilteredProjects() {
  let filtered = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });

  if (selectedIndex !== -1 && currentData[selectedIndex]) {
    let selectedYear = currentData[selectedIndex].label;
    filtered = filtered.filter((project) => project.year === selectedYear);
  }

  return filtered;
}

function renderPieChart(projectsGiven) {
  const svg = d3.select('#projects-pie-plot');
  const legend = d3.select('.legend');

  svg.selectAll('path').remove();
  legend.selectAll('li').remove();

  const rolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year
  );

  currentData = rolledData.map(([year, count]) => {
    return { value: count, label: year };
  });

  const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  const sliceGenerator = d3.pie().value((d) => d.value);
  const arcData = sliceGenerator(currentData);
  const arcs = arcData.map((d) => arcGenerator(d));
  const colors = d3.scaleOrdinal(d3.schemeTableau10);

  arcs.forEach((arc, i) => {
    svg
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(i))
      .attr('class', i === selectedIndex ? 'selected' : '')
      .on('click', () => {
        selectedIndex = selectedIndex === i ? -1 : i;

        const filteredProjects = getFilteredProjects();
        renderProjects(filteredProjects, projectsContainer, 'h2');
        renderPieChart(
          projects.filter((project) => {
            let values = Object.values(project).join('\n').toLowerCase();
            return values.includes(query.toLowerCase());
          })
        );
      });
  });

  currentData.forEach((d, i) => {
    legend
      .append('li')
      .attr('style', `--color:${colors(i)}`)
      .attr('class', `legend-item ${i === selectedIndex ? 'selected' : ''}`)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}

renderProjects(projects, projectsContainer, 'h2');
renderPieChart(projects);

searchInput.addEventListener('input', (event) => {
  query = event.target.value;
  selectedIndex = -1;

  const filteredProjects = getFilteredProjects();
  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
});