import { style } from 'typestyle';

export const StatusStyle = style({

  height: '24px',
  display: 'flex',
  fontSize: 'var(--jp-content-font-size0)',
  color: '#EEEEEE'
})

export const ProgressContainerStyle = style({
  display: 'block'
});

export const ProgessBarContainerStyle = style({
  display: 'flex',
  fontSize: 'var(--jp-content-font-size0)',

  $nest: {
    '& .label': {
      width: '50px',
      fontSize: '9px'
    }
  }
});

export function ProgressBarStyle(stat: number) {

  if (stat < 100) {
    return (
      style({
        width: '40px',
        backgroundColor: 'var(--jp-content-font-color0)',
        borderRadius: '3px',
        height: '6px',
        marginTop: '4px',

        $nest: {
          '& .progress': {
            width:stat*0.4,
            backgroundColor: 'var(--jp-brand-color2)',
            height: '6px',
            borderRadius: '3px 0px 0px 3px'
          }
        }
      })
    )
  } else {
    return (
      style({
        width: '40px',
        backgroundColor: 'var(--jp-content-font-color0)',
        borderRadius: '3px',
        height: '6px',
        marginTop: '4px',

        $nest: {
          '& .progress': {
            width:stat*0.4,
            backgroundColor: 'var(--jp-brand-color2)',
            height: '6px',
            borderRadius: '3px'
          }
        }
      })
    )
  }
}

export const ButtonStyle = style({
  backgroundImage: 'var(--jp-icon-machinelearning)',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '100%',
  backgroundColor: '#757575',
  width: '20px',
  height: '20px',
  border: 'none',
  outline: 'none',
  marginLeft: '13.5px',
  marginTop: '2px'
});
