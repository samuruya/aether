
droppedFiles = null;
const form = document.querySelector('form');




// feature detection for drag&drop upload
var isAdvancedUpload = function()
{
	var div = document.createElement( 'div' );
	return ( ( 'draggable' in div ) || ( 'ondragstart' in div && 'ondrop' in div ) ) && 'FormData' in window && 'FileReader' in window;
}();


// applying the effect for every form
var forms = document.querySelectorAll( '.box' );
Array.prototype.forEach.call( forms, function( form )
{
	var input		 = form.querySelector( 'input[type="file"]' ),
		label		 = form.querySelector( 'label' ),
		errorMsg	 = form.querySelector( '.box__error span' ),
		restart		 = form.querySelectorAll( '.box__restart' ),
		//droppedFiles = false,
		showFiles	 = function( files )
		{
			label.textContent = files.length > 1 ? ( input.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', files.length ) : files[ 0 ].name;
		}
		


		// drag&drop files if the feature is available
		if( isAdvancedUpload )
		{
			form.classList.add( 'has-advanced-upload' ); // letting the CSS part to know drag&drop is supported by the browser

			[ 'drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop' ].forEach( function( event )
			{
				form.addEventListener( event, function( e )
				{
					// preventing the unwanted behaviours
					e.preventDefault();
					e.stopPropagation();
				});
			});
			[ 'dragover', 'dragenter' ].forEach( function( event )
			{
				form.addEventListener( event, function()
				{
					form.classList.add( 'is-dragover' );
				});
			});
			[ 'dragleave', 'dragend', 'drop' ].forEach( function( event )
			{
				form.addEventListener( event, function()
				{
					form.classList.remove( 'is-dragover' );
				});
			});
			form.addEventListener( 'drop', function( e )
			{
				droppedFiles = e.dataTransfer.files; // the files that were dropped
				showFiles( droppedFiles );

				
				//console.log(droppedFiles);

								});
		}

});



//upload_at_submit---------------
form.addEventListener('submit', (e) => {
    
    e.preventDefault();
    // Prevents HTML handling submission
 
    const files = document.getElementById("files");
    const formData = new FormData();
    // Creates empty formData object
    formData.append("name", name.value);
    // Appends value of text input
    for(let i =0; i < files.files.length; i++) {
        formData.append("files", files.files[i]);
    }
    if (droppedFiles != null) {
        for (let i = 0; i < droppedFiles.length; i++) {
            formData.append("files", droppedFiles[i]);
        }
    }
    
    // Appends value(s) of file input
    // Post data to Node and Express server:
    fetch('http://localhost:3000/uploads', {
        method: 'POST',
        body: formData, // Payload is formData object
    })
    .then(res => res.json())
    .then(data => console.log(data));
})