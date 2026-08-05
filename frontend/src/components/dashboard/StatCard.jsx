import React from "react";

export default function StatCard({title, value, subtext, Icon, iconColor}){

    return (
        <div className="stat-card">
            <div className="stat-card-header">
                <span>{title}</span>
                {Icon && <Icon color={iconColor|| `var(--primary)`} size={24}/>}
            </div>
            <div className="stat-card-value">{value}</div>
            <div className="stat-card-sub">{subtext}</div>
        </div>
    );
}