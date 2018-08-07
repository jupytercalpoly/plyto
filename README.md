# plyto
Python Machine Learning Visualization Toolkit

## Prerequisites for Model Visualization

- JupyterLab
- Statusbar Extension

## Prerequisites for Data Exploration

- JupyterLab
- Pandas
- Altair

## Usage

- Open model visualizations from the toolbar or status bar (if model is training)
- Use data exploration functions with 
```python
from plyto import check_data, check_column
```

## Install

## Development

### Contributing

### Install

Requires node 4+ and npm 4+

```bash
git clone https://github.com/jupytercalpoly/plyto.git
cd plyto
npm install
npm run build
jupyter labextension link .
```

To rebuild the package and the JupyterLab app

```bash
npm run build
jupyter lab build
```
