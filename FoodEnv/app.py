import datetime as dt
import numpy as np
import pandas as pd

from flask import (
    Flask,
    render_template,
    jsonify,
    request,
    redirect)

from flask_sqlalchemy import SQLAlchemy
from flask_bootstrap import Bootstrap


#################################################
# Flask Setup
#################################################
app = Flask(__name__)

#################################################
# Database Setup
#################################################

# The database URI
app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///insecurity.db"

db = SQLAlchemy(app)


class Insecure(db.Model):
    __tablename__ = 'insecurity'

    id = db.Column(db.Integer, primary_key=True)
    state = db.Column(db.String)
    indicator = db.Column(db.String)
    year = db.Column(db.String)

    def __repr__(self):
        return '<Insecure %r>' % (self.name)

class Access(db.Model):
    __tablename__ = 'lowAccess'

    FIPS = db.Column(db.Integer, primary_key=True)
    County = db.Column(db.String)
    PCT_LACCESS_POP10 = db.Column(db.String)
    PCT_LACCESS_POP15 = db.Column(db.String)

    PCT_LACCESS_CHILD10 = db.Column(db.String)
    PCT_LACCESS_CHILD15 = db.Column(db.String)

    def __repr__(self):
        return '<Insecure %r>' % (self.name)


# Create database tables
# before any request that's passed through, it will run this function here
@app.before_first_request
def setup():
    # Recreate database each time for demo
    # db.drop_all()
    db.create_all()

#################################################
# Flask Routes
#################################################


@app.route("/")
def home():
    """Render Home Page."""
    return render_template("mrfei.html")

# goes to where the data is stored
@app.route("/insecurity")
def insecurity_data():
    """Return indicator per year"""

    # results is an array of arrays .all returns the data rows
    results = db.session.query(Insecure.indicator, Insecure.year).\
        order_by(Insecure.year.desc())

    indicator = [result[0] for result in results] 
    year = [result[1] for result in results]

    # Generate the plot trace
    plot_trace = {
        "x": year,
        "y": indicator,
        "type": "bar"
    }
    # PRINT(plot_trace)
    return jsonify(plot_trace)


@app.route("/access")
def access_data():
    """Return county and low access percentages"""

    # query for the emoji data using pandas .statement returns the query
    accessResults = db.session.query(Access.County, Access.PCT_LACCESS_CHILD10, Access.PCT_LACCESS_CHILD15).\
        order_by(Access.County.asc())
        # .\limit(10).all()

    County = [result[0] for result in accessResults] 
    PCT_LACCESS_CHILD15 = [result[2] for result in accessResults]
   

    plot_trace = {
        "x": County,
        "y": PCT_LACCESS_CHILD15,
        "type": "bar",
        "title": '% Children with Low Access'
    }
    return jsonify(plot_trace)


# @app.route("/mrfei")
# def emoji_name_data():
#     """Return emoji score and emoji name"""

#     return render_template("mrfei.html")

if __name__ == '__main__':
    app.run(debug=True)
