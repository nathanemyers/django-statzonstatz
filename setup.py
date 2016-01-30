import os
from setuptools import setup

with open(os.path.join(os.path.dirname(__file__), 'README.md')) as readme:
    README = readme.read()

# allow setup.py to be run from any path
os.chdir(os.path.normpath(os.path.join(os.path.abspath(__file__), os.pardir)))

setup(
        name='django-nbapowerranks',
        version='0.1',
        packages=['nbapowerranks'],
        include_package_data=True,
        license='MIT',
        description='A D3 chart of the Weekly NBA Power Ranks',
        long_description=README,
        url='https://www.nathanemyers.com/',
        author='Nathan Myers',
        author_email='nathanemyers@gmail.com',
        classifiers=[
            'Environment :: Web Environment',
            'Framework :: Django',
            'Framework :: Django :: 1.9',
            'Intended Audience :: Developers',
            'License :: OSI Approved :: BSD License',
            'Operating System :: OS Independent',
            'Programming Language :: Python',
            ],
        )

