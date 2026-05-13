package com.example.dao.entity;

import com.baomidou.mybatisplus.annotation.*;

@TableName("user_info")
public class UserInfo {
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @TableField("user_name")
    private String userName;

    @TableField("created_at")
    private java.util.Date createdAt;
}
