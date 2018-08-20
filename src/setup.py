"""
Setup Module to setup Python Handlers (Git Handlers) for the Git Plugin.
"""
import setuptools

with open("README.md", "r") as fh:
    long_description = fh.read()

setuptools.setup(
    name='plyto',
    version='0.1.0',
    author='Noah Stapp, Jenna Landy, and Alena Mueller',
    description="Python Visualization Toolkit for Machine Learning and Data Exploration",
    long_description=long_description,
    long_description_content_type="text/markdown",
    packages=setuptools.find_packages(),
    install_requires=[
        'notebook', 
        'psutil'
    ],
    package_data={'plyto': ['*']},
)
