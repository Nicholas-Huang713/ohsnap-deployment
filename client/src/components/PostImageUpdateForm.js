import React from 'react';
import axios from 'axios';
import {getJwt} from '../helpers/jwt';
import '../App.css';
import loading from '../images/loading.gif';

class ImageUpdateForm extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            currentImage: undefined,
            selectedFile: undefined,
            errorMsg: "",
            hasSubmitted: false
        };
    }

    componentDidMount() {
        this.retrievePost();
    }

    retrievePost = () => {
        const {currentImageId} = this.props;
        const jwt = getJwt();
        axios({ 
        url: `/api/getonepost/${currentImageId}`,
        method: 'GET',
        headers: {'Authorization' : `Bearer ${jwt}`}
        })
        .then((res) => {
            const post = res.data;
            this.setState({
              currentImage: post.imageData
            });
        })
        .catch((err) => {
            console.log('Error:' + err);
        });
    }

    imageChange = (e) => {
        if(!e.target.files[0]) return;
        console.log(e.target.files[0]);
        this.setState({
            currentImage: URL.createObjectURL(e.target.files[0]),
            selectedFile: e.target.files[0]
        });
    }

    handleImageUpdate = (e) => {
        e.preventDefault();
        const jwt = getJwt();
        const {selectedFile} = this.state;
        const {currentImageId} = this.props;
        this.setState({hasSubmitted: true});
        let newImage = new FormData();
        newImage.append('image', selectedFile, selectedFile.name);
        axios({
          url: `/api/updatepostimg/${currentImageId}`,
          method: 'PUT',
          data: newImage, 
          headers: {
            'accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.8',
            'Content-Type': `multipart/form-data; boundary=${newImage._boundary}`,
            'Authorization' : `Bearer ${jwt}`
            }
        })
        .then((response) => {
            if ( 200 === response.status ) {
                if( response.data.error ) {
                    if ( 'LIMIT_FILE_SIZE' === response.data.error.code ) {
                    this.setState({ 
                        errorMsg: 'Max size: 2MB',
                        hasSubmitted: false
                    });
                    } else {
                        console.log( response.data );
                        this.setState({ 
                            errorMsg: "File must be an image",
                            hasSubmitted: false
                        });
                    }
                } else {
                    const post = response.data;
                    console.log(post);
                    this.props.completeImageUpdate();
                }
            }
        })
        .catch(() => {
            this.setState({
                errorMsg: "Error loading image",
                hasSubmitted: false
            })
        });
    };

    render() {
        const {currentImage, hasSubmitted} = this.state;
        let current;
        if(currentImage === undefined){
            current = ""
        }
        else {
           current = currentImage; 
        }
        return (
            <div className="container mt-3 text-center">
                <div className="row">
                    <div className="col-sm"></div>
                    <div className="col-sm-8">
                        <h5>Post Image Update</h5>
                        <div className="preview-img"></div>
                        <img src={current} className="img-thumbnail img-fluid" alt="current post" />
                        <form onSubmit={this.handleImageUpdate}>
                            <span className="text-danger">{this.state.errorMsg}</span>
                            <div className="input-group">
                                <div className="custom-file">
                                    <input type="file" className="custom-file-input" onChange={this.imageChange} />
                                    <label className="custom-file-label" htmlFor="inputGroupFile01">Choose new photo</label>
                                </div>
                            </div>
                            <button className="btn btn-primary">Update</button> 
                            {hasSubmitted && <img src={loading} alt="progress loading" />}
                        </form>
                    </div>
                    <div className="col-sm"></div>
                </div>
            </div>
        );
    }
}

export default ImageUpdateForm;