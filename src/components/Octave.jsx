import React from 'react';
import '../styles/Octave.css';
import { streak } from '../Functions/streaks';

function Octave({offset}) {

	return (
		<div style={{display:'flex', flexDirection:'column'}}>
			<div className='topBar'></div>
			<div className="octave">
				<div className='key white' id={offset}>a</div>
				<div className='key black' id={offset + 1}>a#</div>
				<div className='key white' id={offset + 2}>b</div>
				<div className='key white' id={offset + 3}>c</div>
				<div className='key black' id={offset + 4}>c#</div>
				<div className='key white' id={offset + 5}>d</div>
				<div className='key black' id={offset + 6}>d#</div>
				<div className='key white' id={offset + 7}>e</div>
				<div className='key white' id={offset + 8}>f</div>
				<div className='key black' id={offset + 9}>f#</div>
				<div className='key white' id={offset + 10}>g</div>
				<div className='key black' id={offset + 11}>g#</div>
			</div>
		</div>
	);
}

export default Octave;