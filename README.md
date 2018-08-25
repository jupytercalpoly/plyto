# plyto

Python Visualization Toolkit for Machine Learning and Data Exploration

## Prerequisites for Model Visualization

- JupyterLab
- Statusbar Extension

## Prerequisites for Data Exploration

- JupyterLab
- Pandas
- Altair

## Usage

- Go through the [example notebooks](https://github.com/jupytercalpoly/plyto/tree/master/notebooks)
- Use data exploration functions with 
```python
from plyto import check_data, check_column
```

## Install

```python
pip install plyto
jupyter labextension install jupyterlab-plyto
```

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
