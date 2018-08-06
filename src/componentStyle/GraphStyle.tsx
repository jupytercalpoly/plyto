import { style } from 'typestyle';

export function statsContainerStyle(done) {
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
      margin: '15px 0px 17px 0px'
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
  margin: '25px'
});
