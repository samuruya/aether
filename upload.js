
droppedFiles = null;
const form = document.querySelector('form');




// feature detection
var isAdvancedUpload = function()
{
	var div = document.createElement( 'div' );
	return ( ( 'draggable' in div ) || ( 'ondragstart' in div && 'ondrop' in div ) ) && 'FormData' in window && 'FileReader' in window;
}();


// applying effect
var forms = document.querySelectorAll( '.box' );
Array.prototype.forEach.call( forms, function( form )
{
	var input		 = form.querySelector( 'input[type="file"]' ),
		label		 = form.querySelector( 'label' ),
		errorMsg	 = form.querySelector( '.box__error span' ),
		restart		 = form.querySelectorAll( '.box__restart' ),
		showFiles	 = function( files )
		{
			label.textContent = files.length > 1 ? ( input.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', files.length ) : files[ 0 ].name;
		}
		


		if( isAdvancedUpload )
		{
			form.classList.add( 'has-advanced-upload' ); 

			[ 'drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop' ].forEach( function( event )
			{
				form.addEventListener( event, function( e )
				{
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
				droppedFiles = e.dataTransfer.files; 
				showFiles( droppedFiles );

				});
		}

});



//upload_at_submit---------------
form.addEventListener('submit', (e) => {
    
    e.preventDefault();
    
 
    const files = document.getElementById("files");
    const formData = new FormData();
    
    formData.append("name", name.value);
    
    for(let i =0; i < files.files.length; i++) {
        formData.append("files", files.files[i]);
    }
    if (droppedFiles != null) {
        for (let i = 0; i < droppedFiles.length; i++) {
            formData.append("files", droppedFiles[i]);
        }
    }
    
    
    fetch('http://localhost:3000/uploads', {
        method: 'POST',
        body: formData, 
    })
    .then(res => res.json())
    .then(data => console.log(data));
})