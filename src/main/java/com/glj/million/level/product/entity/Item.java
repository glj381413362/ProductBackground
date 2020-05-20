package com.glj.million.level.product.entity;

import tk.mybatis.mapper.annotation.KeySql;

import java.util.Date;
import javax.persistence.*;

public class Item {
    @Id
    @KeySql(useGeneratedKeys = true)
    private Integer id;

    private String title;

    private String content;

    private String notes;

    private String fabric;

    @Column(name = "main_figure")
    private String mainFigure;

    @Column(name = "details_figure1")
    private String detailsFigure1;

    @Column(name = "details_figure2")
    private String detailsFigure2;

    @Column(name = "last_generate")
    private Date lastGenerate;

    @Column(name = "html_status")
    private String htmlStatus;

    private String location;

    @Column(name = "template_name")
    private String templateName;

    private String category;

    /**
     * @return id
     */
    public Integer getId() {
        return id;
    }

    /**
     * @param id
     */
    public void setId(Integer id) {
        this.id = id;
    }

    /**
     * @return title
     */
    public String getTitle() {
        return title;
    }

    /**
     * @param title
     */
    public void setTitle(String title) {
        this.title = title == null ? null : title.trim();
    }

    /**
     * @return content
     */
    public String getContent() {
        return content;
    }

    /**
     * @param content
     */
    public void setContent(String content) {
        this.content = content == null ? null : content.trim();
    }

    /**
     * @return notes
     */
    public String getNotes() {
        return notes;
    }

    /**
     * @param notes
     */
    public void setNotes(String notes) {
        this.notes = notes == null ? null : notes.trim();
    }

    /**
     * @return fabric
     */
    public String getFabric() {
        return fabric;
    }

    /**
     * @param fabric
     */
    public void setFabric(String fabric) {
        this.fabric = fabric == null ? null : fabric.trim();
    }

    /**
     * @return main_figure
     */
    public String getMainFigure() {
        return mainFigure;
    }

    /**
     * @param mainFigure
     */
    public void setMainFigure(String mainFigure) {
        this.mainFigure = mainFigure == null ? null : mainFigure.trim();
    }

    /**
     * @return details_figure1
     */
    public String getDetailsFigure1() {
        return detailsFigure1;
    }

    /**
     * @param detailsFigure1
     */
    public void setDetailsFigure1(String detailsFigure1) {
        this.detailsFigure1 = detailsFigure1 == null ? null : detailsFigure1.trim();
    }

    /**
     * @return details_figure2
     */
    public String getDetailsFigure2() {
        return detailsFigure2;
    }

    /**
     * @param detailsFigure2
     */
    public void setDetailsFigure2(String detailsFigure2) {
        this.detailsFigure2 = detailsFigure2 == null ? null : detailsFigure2.trim();
    }

    /**
     * @return last_generate
     */
    public Date getLastGenerate() {
        return lastGenerate;
    }

    /**
     * @param lastGenerate
     */
    public void setLastGenerate(Date lastGenerate) {
        this.lastGenerate = lastGenerate;
    }

    /**
     * @return html_status
     */
    public String getHtmlStatus() {
        return htmlStatus;
    }

    /**
     * @param htmlStatus
     */
    public void setHtmlStatus(String htmlStatus) {
        this.htmlStatus = htmlStatus == null ? null : htmlStatus.trim();
    }

    /**
     * @return location
     */
    public String getLocation() {
        return location;
    }

    /**
     * @param location
     */
    public void setLocation(String location) {
        this.location = location == null ? null : location.trim();
    }

    /**
     * @return template_name
     */
    public String getTemplateName() {
        return templateName;
    }

    /**
     * @param templateName
     */
    public void setTemplateName(String templateName) {
        this.templateName = templateName == null ? null : templateName.trim();
    }

    /**
     * @return category
     */
    public String getCategory() {
        return category;
    }

    /**
     * @param category
     */
    public void setCategory(String category) {
        this.category = category == null ? null : category.trim();
    }
}