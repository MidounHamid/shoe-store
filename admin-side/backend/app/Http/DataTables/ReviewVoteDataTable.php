<?php

namespace App\Http\DataTables;

class ReviewVoteDataTable extends DataTable
{
    protected $table = 'review_votes';
    protected $primaryKey = 'id';

    protected function setColumns()
    {
        $this->columns = ['id', 'review_id', 'user_id', 'vote', 'created_at'];
        $this->searchableColumns = [];
        $this->orderableColumns = [
            0 => 'review_votes.id',
            1 => 'review_votes.review_id',
            2 => 'review_votes.user_id',
            3 => 'review_votes.vote',
            4 => 'review_votes.created_at',
        ];
    }

    protected function applyJoins($query)
    {
        $query->leftJoin('product_reviews', 'review_votes.review_id', '=', 'product_reviews.id')
              ->leftJoin('users', 'review_votes.user_id', '=', 'users.id')
              ->select('review_votes.*', 'users.email as user_email');
    }

    protected function formatRow($item)
    {
        $voteText = $item->vote == 1 ? 'Helpful' : 'Not Helpful';
        return [
            $item->id,
            $item->review_id,
            $item->user_email ?? '-',
            $voteText,
            $item->created_at,
            $this->getActionButtons($item),
        ];
    }
}

