setlocal
copy index.html docs
copy dist/bundle.js docs
cd css
copy style.css ../docs
cd ..
move style.css docs
cd docs
move style.css css
setup-gh-pages.cmd dist/bundle.js bundle.js
cd ..