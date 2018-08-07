import altair as alt
import pandas as pd
from IPython.display import display, Markdown

def Quartile(data, col):
    q1 = data[col].quantile(.25)
    q3 = data[col].quantile(.75)
    iqr = q3 - q1
    upperLim = q3 + 1.5*iqr
    lowerLim = q1 - 1.5*iqr
    return (lowerLim, upperLim)

def CheckData(data, columns=[], missing=0.1, cardinality=15, floatFrequency=30, catFrequency=100, outlierFunction=Quartile, title=True):
    """
    Checks all columns of the given pandas dataframe for data abnormalities
    :param columns: a list of column names to analyze, defaults to all columns in the dataframe
    :param missing: a cutoff point for high percentage of missing / zero values, defaults to 10%
    :param cardinality: a cutoff point for high cardinality of a categorical column, defaults to 15
    :param floatFrequency: a cutoff point for high frequency of floating point numbers, defaults to 30
    :param catFrequency: a cutoff point for low frequency of categories in categorical columns, defaults to 100
    :param outlierFunction: a function of the dataset and column name that returns the lower and upper limit for outliers,
        defaults to 1.5*IQR above the 3rd quartile or below the 1st quartile
    """

    if columns == []:
        columns = data.columns
    abnormalities = {}

    for col in columns:
        abnormalities[col] = []

        """
        Check for high proportion of zeros or missing values
        """
        propZero = sum(data[col] == 0)/len(data)
        if propZero > missing:
            ab = "high proportion of zero values at " + str(round(propZero*100, 2)) + "%"
            abnormalities[col].append(ab)

        propNull = sum(data[col].isnull())/len(data)
        if propNull > missing:
            ab = "high proportion of null values at " + str(round(propNull*100, 2)) + "%"
            abnormalities[col].append(ab)

        """
        Check for high cardinality of categorical variables
        """ 
        if data[col].dtype == 'O':
            numUnique = len(data[col].unique())
            if numUnique > cardinality:
                ab = "high cardinality with " + str(numUnique) + " unique values"
                abnormalities[col].append(ab)

        """
        Check for high frequency of floating point columns
        """
        if data[col].dtype == 'float64':
            numHighFreq = sum(data.groupby(col)[col].count().values > floatFrequency)
            if numHighFreq > 0:
                ab = "high frequency of floating point numbers with " + str(numHighFreq) + " number(s) having frequency over " + str(floatFrequency)
                abnormalities[col].append(ab)

        """
        Check for low frequency of categories of categorical variables
        """
        if data[col].dtype == 'O':
            lowFreqCount = 0
            for val in data.groupby(col)[col].count().values:
                if val < catFrequency:
                    lowFreqCount += 1
            if lowFreqCount > 0:
                ab = "low frequncy in categories with " + str(lowFreqCount) + " categorie(s) having under " + str(catFrequency) + " observations"
                abnormalities[col].append(ab)

        """
        Check for outliers in quantitative data
        """
        if data[col].dtype == 'float64':
            lowerLim, upperLim = outlierFunction(data, col)
            numUpperOutliers = sum(data[col] > upperLim)
            numLowerOutliers = sum(data[col] < lowerLim)
            if numUpperOutliers > 10 or numLowerOutliers > 10:
                ab = "high number of outliers with " + str(numUpperOutliers) + " high outliers and " + str(numLowerOutliers) + " low outliers"
                abnormalities[col].append(ab)

    has_abnormalities = False
    longestCol = 0
    for col in columns:
        if len(col) > longestCol:
            longestCol = len(col)

    for col in abnormalities:
        if len(abnormalities[col]) > 0:
            abs = ''
            for ab in abnormalities[col]:
                abs += '\n- ' + ab
            if title:
                display(Markdown(col + ": " + abs))
            else:
                display(Markdown(abs))
            has_abnormalities = True


    if not has_abnormalities:
        display(Markdown("No abnormalities found"))


def CheckColumn(data, columns, bins=False, missing=0.1, cardinality=15, floatFrequency=30, catFrequency=100, outlierFunction=Quartile):
    """
    Presents a summary of given columns of the given pandas dataframe
    including summary statistics, bar chart or histogram, and any abnormalities found
    
    :param data: a pandas dataframe
    :param columns: a single column name or a list of column names to analyze
    :param bins: a boolean value or list of boolean values to determine whether to bin the histogram for each column
    :param missing: a cutoff point for high percentage of missing / zero values, defaults to 10%
    :param cardinality: a cutoff point for high cardinality of a categorical column, defaults to 15
    :param floatFrequency: a cutoff point for high frequency of floating point numbers, defaults to 30
    :param catFrequency: a cutoff point for low frequency of categories in categorical columns, defaults to 100
    :param outlierFunction: a function of the dataset and column name that returns the lower and upper limit for outliers,
        defaults to 1.5*IQR above the 3rd quartile or below the 1st quartile
    """

    if isinstance(columns, str):
        # with only one column, convert to lists
        columns = [columns]
        bins = [bins]
    else:
        if bins == False:
            # with multiple columns and no bins, 
            # convert to list of correct length
            bins = [False]*len(columns)

        if isinstance(bins, int):
            # with multiple columns and only one bin 
            # specification, convert to list of correct length
            bins = [bins]*len(columns)

    i = 0
    for col in columns:
        bin = bins[i]

        if data[col].dtype == 'O':
            # cannot bin categorical data
            bin = False

        if bin == False:
            if data[col].dtype == 'O':
                chart = alt.Chart(data).mark_bar(color='#64b5f6').encode(
                    alt.X(col, axis=alt.Axis(title=col.title()), sort = alt.SortField(field = 'count()', order = 'descending', op='values')),
                    alt.Y("count()")
                )
            else:
                chart = alt.Chart(data).mark_bar(color='#64b5f6').encode(
                    alt.X(col, axis=alt.Axis(title=col.title())),
                    alt.Y("count()")
                )
        else:
            chart = alt.Chart(data).mark_bar(color='#64b5f6').encode(
                alt.X(col, bin=alt.Bin(maxbins = bin), axis=alt.Axis(title=col.title())),
                alt.Y("count()")
            )

        if (data[col].dtype == "float64"):
            stats = data[col].describe()
        else:
            stats = data.groupby(col)[col].agg(['count'])
            stats['prop'] = stats['count']/len(data)

        stats = pd.DataFrame(stats).T
        
        display(Markdown('###### Column Summary: ' + col.title()))
        display(stats)
        display(chart)
        CheckData(data, [col], missing=missing, cardinality=cardinality, floatFrequency=floatFrequency, catFrequency=catFrequency, outlierFunction=outlierFunction, title=False)

        i+=1
        