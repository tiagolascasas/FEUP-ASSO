setlocal
copy index.html docs
copy dist/bundle.js docs
cd css
copy style.css ../docs
cd ..
move style.css docs
cd docs
move bundle.js dist
move style.css css
cd ..