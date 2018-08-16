import { style } from 'typestyle';

export function statsContainerStyle(done: boolean) {
  if (done) {
    return style({
      width: '100%',
      display: 'block',
      margin: '15px 0px 0px 0px'
    });
  } else {
    return style({
      width: '100%',
      display: 'block',
      margin: '15px 0px 2px 0px'
    });
  }
}

export const statContainerStyle = style({
  width: '100%',
  display: 'flex',
  marginBottom: '2px'
});

export const labelStyle = style({
  width: '150px',
  boxSizing: 'border-box',
  marginLeft: '75px',
  display: 'flex',

  $nest: {
    '& .stat-label': {
      display: 'flex'
    },

    '& .stat': {
      width: '50px',
      lineHeight: '20px',
      textAlign: 'right'
    },

    '& .final-avg': {
      lineHeight: '20px'
    }
  }
});

export const statStyle = style({
  display: 'inherit'
});

export const graphStyle = style({
  margin: '25px',

  $nest: {
    '& .vega-actions': {
      paddingLeft: '50px',
      paddingTop: '10px',

      $nest: {
        '& a': {
          color: 'var(--jp-content-font-color0)',
          textDecoration: 'none',
          marginRight: '20px',
          padding: '4px',
          backgroundColor: 'var(--jp-layout-color2)',
          border: 'var(--jp-border-width) solid var(--jp-border-color0)',
          borderRadius: 'var(--jp-border-radius)'
        },
        '& a:hover': {
          backgroundColor: 'var(--jp-layout-color3)'
        }
      }
    }
  }
});
