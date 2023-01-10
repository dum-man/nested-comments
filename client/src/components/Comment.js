import { useState } from 'react';
import { FaEdit, FaHeart, FaRegHeart, FaReply, FaTrash } from 'react-icons/fa';
import IconBtn from './IconBtn';
import { usePost } from '../contexts/PostContext';
import CommentList from './CommentList';
import CommentForm from './CommentForm'
import { useAsyncFn } from '../hooks/useAsync';
import { createComment, updateComment, deleteComment, toggleCommentLike } from '../services/comments'
import { useUser } from '../hooks/useUser';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
})

const Comment = ({ id, message, user, createdAt, likeCount, likedByMe }) => {

    const { post, getReplies, createLocalComment, updateLocalComment, deleteLocalComment, toggleLocalCommentLike } = usePost()
    const childComments = getReplies(id)
    const currentUser = useUser()
    const createCommentFn = useAsyncFn(createComment)
    const updateCommentFn = useAsyncFn(updateComment)
    const deleteCommentFn = useAsyncFn(deleteComment)
    const toggleCommentLikeFn = useAsyncFn(toggleCommentLike)

    const [areChildrenHidden, setAreChildrenHidden] = useState(false)
    const [isReplying, setIsReplying] = useState(false)
    const [isEditing, setIsEditing] = useState(false)

    function onCommentReply(message) {
        return createCommentFn.execute({ postId: post.id, message, parentId: id }).then(comment => {
            setIsReplying(false)
            createLocalComment(comment)
        })
    }

    function onCommentUpdate(message) {
        return updateCommentFn.execute({ postId: post.id, message, id }).then(comment => {
            setIsEditing(false)
            updateLocalComment(id, comment.message)
        })
    }

    function onCommentDelete() {
        return deleteCommentFn.execute({ postId: post.id, id }).then((comment) => {
            deleteLocalComment(comment.id)
        })
    }

    function onToggleCommentLike() {
        return toggleCommentLikeFn.execute({ id, postId: post.id })
            .then(({ addLike }) => toggleLocalCommentLike(id, addLike))
    }

    return (
        <>
            <div className='comment'>
                <div className='header'>
                    <span className='name'>
                        {user.name}
                    </span>
                    <span className='date'>
                        {dateFormatter.format(Date.parse(createdAt))}
                    </span>
                </div>
                {isEditing ? (
                    <CommentForm
                        autoFocus
                        initialValue={message}
                        loading={updateCommentFn.loading}
                        error={updateCommentFn.error}
                        onSubmit={onCommentUpdate}
                    />
                ) : (
                    <div className='message'>{message}</div>
                )}
                <div className='footer'>
                    <IconBtn
                        Icon={likedByMe ? FaHeart : FaRegHeart}
                        aria-label={likedByMe ? 'Unlike' : 'Like'}
                        disabled={toggleCommentLikeFn.loading}
                        onClick={onToggleCommentLike}
                    >
                        {likeCount}
                    </IconBtn>
                    <IconBtn
                        aria-label={isReplying ? 'Cancel Reply' : 'Reply'}
                        Icon={FaReply}
                        isActive={isReplying}
                        onClick={() => setIsReplying(prev => !prev)}
                    />
                    {user.id === currentUser.id && (
                        <>
                            <IconBtn
                                aria-label={isEditing ? 'Cancel Edit' : 'Edit'}
                                Icon={FaEdit}
                                isActive={isEditing}
                                onClick={() => setIsEditing(prev => !prev)}
                            />
                            <IconBtn
                                aria-label='Delete'
                                color='danger'
                                Icon={FaTrash}
                                disabled={deleteCommentFn.loading}
                                onClick={onCommentDelete}
                            />
                        </>
                    )}
                </div>
                {deleteCommentFn.error && (
                    <div className='error-msg mt-1'>
                        {deleteCommentFn.error}
                    </div>
                )}
            </div>
            {isReplying && (
                <div className='mt-1 ml-3'>
                    <CommentForm autoFocus loading={createCommentFn.loading} error={createCommentFn.error} onSubmit={onCommentReply} />
                </div>
            )}
            {childComments?.length > 0 && (
                <>
                    <div className={`nested-comments-stack ${areChildrenHidden ? 'hide' : ''}`}>
                        <button
                            aria-label='Hide Replies'
                            className='collapse-line'
                            onClick={() => setAreChildrenHidden(true)}
                        />
                        <div className='nested-comments'>
                            <CommentList comments={childComments} />
                        </div>
                    </div>
                    <button
                        className={`btn mt-1 ${!areChildrenHidden ? "hide" : ""}`}
                        onClick={() => setAreChildrenHidden(false)}
                    >
                        Show Replies
                    </button>
                </>
            )}
        </>
    );
};

export default Comment;