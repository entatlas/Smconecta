fetch('http://localhost:3000/api/fix-trigger2')
  .then(r => r.text())
  .then(t => console.log(t))
  .catch(e => console.error(e));
