from setuptools import setup, find_packages

setup(
    name="revenue-forecast-module",
    version="1.0.0",
    packages=find_packages(),
    install_requires=[
        "numpy",
        "pandas",
        "scikit-learn",
        "flask",
    ],
    python_requires=">=3.10",
) 