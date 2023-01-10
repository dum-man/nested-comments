import React, { useState } from 'react';

const CommentForm = ({ loading, error, onSubmit, autoFocus = false, initialValue = "" }) => {

    const [message, setMessage] = useState(initialValue)

    const handleSubmit = (evt) => {
        evt.preventDefault()
        onSubmit(message).then(() => setMessage(""))
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className='comment-form-row'>
                <textarea
                    className='message-input'
                    autoFocus={autoFocus}
                    value={message}
                    onChange={evt => setMessage(evt.target.value)}
                />
                <button className='btn' type='submit' disabled={loading}>
                    {loading ? "Loading" : "Post"}
                </button>
            </div>
            <div className='error-msg'>
                {error}
            </div>
        </form>
    );
};

export default CommentForm;